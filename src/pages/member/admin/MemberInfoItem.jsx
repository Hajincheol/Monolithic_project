import React, { useEffect, useState } from 'react';
import { Button, Card, Pagination, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MemberInfoItem = (props) => {

    const navi = useNavigate();
    const { id, name, email } = props.member;
    const[role, setRole] = useState(props.member.role);

    const[pList, setPList] = useState([]);
    const[oList, setOList] = useState([]);
    const[oPage, setOPage] = useState(1);
    const[pPage, setPPage] = useState(1);

    useEffect(() => {
        productList();
        orderingList();
    }, []);

    // 만료된 accessToken을 새로 발급하기
    const newAccessToken = async() => {

        try {
            const res = await fetch(`http://localhost:8081/member/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json;charset=utf-8"
                },
                credentials: "include",
                body: JSON.stringify({'refreshToken': localStorage.getItem("refreshToken")})
            });

            if(!res.ok) {
                alert("인증 오류 발생");
            } else {
                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
            }

        } catch {
            alert("인증 오류");
        }
    }

    // 해당 회원이 등록한 product list 불러오기
    const productList = async() => {

        try {
            const res = await fetch(`http://localhost:8081/product/selectByMemberId/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            if(res.ok) {
                const data = await res.json();

                setPList(data);

            } else if(res.status === 401) {

                // 인증 에러(401)가 발생시 accessToken이 만료되었다는 에러이니 재발급
                if(window.confirm("로그인 시간이 만료되었습니다. 연장하시겠습니까?")) {
                    newAccessToken();

                } else {

                    alert("로그아웃 되셨습니다.");

                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("id");

                    navi("/");
                }
            }
        } catch {
            alert("통신 에러");
        }
    }

    // 해당 회원이 등록한 ordering list 불러오기 => 정상적으로 불러오는데 성공시
    const orderingList = async() => {

        try {
            const res = await fetch(`http://localhost:8081/ordering/selectByMemberId/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            if(res.ok) {
                const data = await res.json();

                setOList(data);

            } else if(res.status === 401) {

                // 인증 에러(401)가 발생시 accessToken이 만료되었다는 에러이니 재발급
                if(window.confirm("로그인 시간이 만료되었습니다. 연장하시겠습니까?")) {
                    newAccessToken();

                } else {

                    alert("로그아웃 되셨습니다.");

                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("id");

                    navi("/");
                }
            }
        } catch {
            alert("통신 에러");
        }
    }

    // 회원 정지 여부
    const changeMemberStatus = async() => {

        try {
            const res = await fetch(`http://localhost:8081/member/changeStatus/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            
            if(res.ok) {
                if(role === 'USER') {
                    alert("성공적으로 해당 회원은 정지되었습니다.");
                    setRole('BLACK');

                    productList();
                    orderingList();

                } else if(role === 'BLACK') {
                    alert("성공적으로 해당 회원의 정지가 해제 되었습니다.");
                    setRole('USER');
                }

            } else if(res.status === 401) {
                
                // 인증 에러(401)가 발생시 accessToken이 만료되었다는 에러이니 재발급
                if(window.confirm("로그인 시간이 만료되었습니다. 연장하시겠습니까?")) {
                    newAccessToken();

                } else {

                    alert("로그아웃 되셨습니다.");

                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("id");

                    navi("/");
                }

            } else {
                alert("통신 에러");
            }
        } catch {
            alert("통신 에러");
        }
    }

    // 제품 상태 변경
    const changeProductStatus = async() => {

        try {
            const res = await fetch(`http://localhost:8081/product/changeStatus/${pList[pPage-1].id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            
            if(res.ok) {
                if(pList[pPage-1].productStatus === 'UNAVAILABLE') {
                    alert("성공적으로 해당 회원의 제품 판매 금지가 해제되었습니다.");
                    orderingList();

                } else if(pList[pPage-1].productStatus === 'AVAILABLE') {
                    alert("성공적으로 해당 회원의 제품이 판매 금지되었습니다.");
                }
                productList();

            } else if(res.status === 401) {
                
                // 인증 에러(401)가 발생시 accessToken이 만료되었다는 에러이니 재발급
                if(window.confirm("로그인 시간이 만료되었습니다. 연장하시겠습니까?")) {
                    newAccessToken();

                } else {

                    alert("로그아웃 되셨습니다.");

                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("id");

                    navi("/");
                }

            } else {
                alert("통신 에러");
            }
        } catch {
            alert("통신 에러");
        }
    }

    return (
        <Card>
            <Card.Body>
                <Tabs
                    defaultActiveKey="member"
                    id="fill-tab-example"
                    className="mb-3"
                    justify
                >

                    <Tab eventKey="member" title="회원 정보">
                        <Card.Text>회원 번호 : {id}</Card.Text>
                        <Card.Text>회원 이름 : {name}</Card.Text>
                        <Card.Text>이메일 : {email}</Card.Text>
                        <Card.Text>권한 상태 : {role}</Card.Text>

                        {role === 'USER' &&
                            <Button variant="dark" onClick={changeMemberStatus}>black</Button>
                        }
                        
                        {role === 'BLACK'&&
                            <Button variant="primary" onClick={changeMemberStatus}>white</Button>
                        }
                    </Tab>

                    <Tab eventKey="product" title="등록 제품 정보">

                        {pList.length > 0 ?
                            <>
                                <Card.Text>번호 : {pList[pPage-1].id}</Card.Text>
                                <Card.Text>이름 : {pList[pPage-1].name}</Card.Text>
                                <Card.Text>분류 : {pList[pPage-1].category}</Card.Text>
                                <Card.Text>가격 : {pList[pPage-1].price}</Card.Text>
                                <Card.Text>수량 : {pList[pPage-1].stockQuantity}</Card.Text>
                                <Card.Text>상태 : {pList[pPage-1].productStatus}</Card.Text>

                                {pList[pPage-1].productStatus === 'AVAILABLE' ?
                                    <Button variant="dark" onClick={changeProductStatus}>UNAVAILABLE</Button>
                                :
                                    <Button variant="primary" onClick={changeProductStatus}>AVAILABLE</Button>
                                }

                                <Pagination className='d-flex justify-content-center'>
                                    {pPage > 2 ? <Pagination.First onClick={() => setPPage(1)} /> : <Pagination.First disabled/>}
                                    {pPage > 1 ? <Pagination.Prev onClick={() => setPPage(pPage-1)} /> : <Pagination.Prev disabled/>}
                                    {pPage-2 > 0 && <Pagination.Item onClick={() => setPPage(pPage-2)}>{pPage-2}</Pagination.Item>}
                                    {pPage-1 > 0 && <Pagination.Item onClick={() => setPPage(pPage-1)}>{pPage-1}</Pagination.Item>}

                                    <Pagination.Item active>{pPage}</Pagination.Item>

                                    {pPage < pList.length && <Pagination.Item onClick={() => setPPage(pPage+1)}>{pPage+1}</Pagination.Item>}
                                    {pPage < pList.length-1 && <Pagination.Item onClick={() => setPPage(pPage+2)}>{pPage+2}</Pagination.Item>}
                                    {pPage < pList.length ? <Pagination.Next onClick={() => setPPage(pPage+1)} /> : <Pagination.Next disabled/>}
                                    {pPage < pList.length-1 ? <Pagination.Last onClick={() => setPPage(pList.length)} /> : <Pagination.Last disabled/>}
                                </Pagination>
                            </>
                        :
                            <Card.Text>등록된 제품이 존재하지 않습니다.</Card.Text>
                        }
                    </Tab>

                    <Tab eventKey="ordering" title="제품 주문 정보">

                        {oList.length > 0 ?
                            <>
                                <Card.Text>주문번호 : {oList[oPage-1].id}</Card.Text>
                                <Card.Text>주문수량 : {oList[oPage-1].quantity}</Card.Text>
                                <Card.Text>주문상태 : {oList[oPage-1].orderStatus}</Card.Text>

                                {oList.product !== null ?
                                    <>
                                        <Card.Text>제품번호 : {oList[oPage-1].product.id}</Card.Text>
                                        <Card.Text>제품이름 : {oList[oPage-1].product.name}</Card.Text>
                                        <Card.Text>제품분류 : {oList[oPage-1].product.category}</Card.Text>
                                        <Card.Text>현재재고 : {oList[oPage-1].product.stockQuantity}</Card.Text>
                                    </>
                                :
                                    <Card.Text>해당 제품은 삭제되었습니다.</Card.Text>
                                }

                                <Pagination className='d-flex justify-content-center'>
                                    {oPage > 2 ? <Pagination.First onClick={() => setOPage(1)} /> : <Pagination.First disabled/>}
                                    {oPage > 1 ? <Pagination.Prev onClick={() => setOPage(oPage-1)} /> : <Pagination.Prev disabled/>}
                                    {oPage-2 > 0 && <Pagination.Item onClick={() => setOPage(oPage-2)}>{oPage-2}</Pagination.Item>}
                                    {oPage-1 > 0 && <Pagination.Item onClick={() => setOPage(oPage-1)}>{oPage-1}</Pagination.Item>}

                                    <Pagination.Item active>{oPage}</Pagination.Item>

                                    {oPage < oList.length && <Pagination.Item onClick={() => setOPage(oPage+1)}>{oPage+1}</Pagination.Item>}
                                    {oPage < oList.length-1 && <Pagination.Item onClick={() => setOPage(oPage+2)}>{oPage+2}</Pagination.Item>}
                                    {oPage < oList.length ? <Pagination.Next onClick={() => setOPage(oPage+1)} /> : <Pagination.Next disabled/>}
                                    {oPage < oList.length-1 ? <Pagination.Last onClick={() => setOPage(oList.length)} /> : <Pagination.Last disabled/>}
                                </Pagination>
                            </>
                        :
                            <Card.Text>주문이 존재하지 않습니다.</Card.Text>
                        }
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
};

export default MemberInfoItem;