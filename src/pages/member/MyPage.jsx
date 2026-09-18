import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Pagination, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {

    // navigate
    const navi = useNavigate();

    // 등록 or 주문 상품 list / page / 등록or주문 탭 여부
    const[pList, setPList] = useState([]);
    const[oList, setOList] = useState([]);
    const[pPage, setPPage] = useState(1);
    const[oPage, setOPage] = useState(1)

    // 내 정보
    const[myinfo, setMyinfo] = useState({
        'name': '',
        'email': ''
    });

    useEffect(() => {

        myInfoUpdate();
        myProductList();
        myOrderList();

    }, []);

    // accessToken 재발급
    // 만료된 accessToken을 새로 발급하기
    const newAccessToken = async() => {
        console.log("신규 accessToken 생성");

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

    // 내 정보 -----------------------
    // 내 상품 목록 가져오기
    const myProductList = () => {

        fetch(`http://localhost:8081/product/selectByMemberId/${localStorage.getItem("id")}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            credentials: "include"
        })
        .then((res) => {

            if(res.ok) {
                return res.json();

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
                return null;
            }
        })
        .then((res) => {

            if(res !== null) {

                setPList(res);
            }
        })
        .catch((err) => alert("product list 에러 발생", err));
    }

    // 내 주문 목록 가져오기
    const myOrderList = () => {

        fetch(`http://localhost:8081/ordering/selectByMemberId/${localStorage.getItem("id")}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            credentials: "include"
        })
        .then((res) => {

            if(res.ok) {
                return res.json();

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
                return null;
            }
        })
        .then((res) => {

            if(res !== null) {

                setOList(res);
            }
        })
        .catch((err) => alert("order list 에러 발생", err));
    }

    // 내 정보 가져오기
    const myInfoUpdate = () => {

        fetch(`http://localhost:8081/member/mypage/myinfo`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            credentials: "include"
        })
        .then((res) => {

            if(res.ok) {
                return res.json();

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
                return null;
            }
        })
        .then((res) => {

            if(res !== null) {

                setMyinfo({
                    ...myinfo,
                    ...res
                });
            }
        })
        .catch((err) => alert("에러 발생", err));
    }

    // 기능 --------------------------
    // user 이름 바꾸기
    const nameChange = async(e) => {

        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:8081/member/mypage/nameChange/` + myinfo.name, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                },
                credentials: "include"
            });

            if(res.ok) {
                const data = await res.json();

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                myInfoUpdate();

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
            console.log("통신 실패");
        }
    }

    // 주문 취소
    const orderCancel = async() => {

        if(window.confirm("정말 취소 하시겠습니까?")) {
            try {
                const res = await fetch(`http://localhost:8081/ordering/cancel/${oList[oPage-1].id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                    },
                    credentials: "include"
                });

                if(res.ok) {
                    alert("취소 되셨습니다.");

                    myOrderList();
                    
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
                console.log("통신 실패");
            }
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

                    myProductList();
                    myOrderList();

                } else if(pList[pPage-1].productStatus === 'AVAILABLE') {
                    alert("성공적으로 해당 회원의 제품이 판매 금지되었습니다.");
                    myProductList();
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

    return (
        <div>
            <br />
            <br />
            <Container style={{ maxWidth: '50rem'}}>
                <Card>
                    <Card.Body>
                        {/* onSelect 다른 Tab이 선택되면 실행되는 속성 */}
                        {/* activeKey 현재 탭 설정 */}
                        <Tabs
                            defaultActiveKey="home"
                            id="fill-tab-example"
                            className="mb-3"
                            justify
                        >
                            <Tab eventKey="home" title="내 정보">
                                <Card.Text>이름 : {myinfo.name}</Card.Text>
                                <Card.Text>이메일 : {myinfo.email}</Card.Text>
                            </Tab>


                            <Tab eventKey="name" title="이름 수정">
                                <Form onSubmit={nameChange}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>이름</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="이름을 입력해 주세요."
                                            onChange={(e) => setMyinfo({...myinfo, 'name': e.target.value})}
                                            defaultValue={myinfo.name}
                                            required
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit">변경</Button>
                                    {' '}
                                    <Button variant="danger" type="reset">초기화</Button>
                                </Form>
                            </Tab>


                            <Tab eventKey="product" title="등록한 상품">

                                {pList.length > 0
                                ?
                                    <>
                                        <Card.Text>번호 : {pList[pPage-1].id}</Card.Text>
                                        <Card.Text>이름 : {pList[pPage-1].name}</Card.Text>
                                        <Card.Text>분류 : {pList[pPage-1].category}</Card.Text>
                                        <Card.Text>가격 : {pList[pPage-1].price}</Card.Text>
                                        <Card.Text>수량 : {pList[pPage-1].stockQuantity}</Card.Text>
                                        
                                        {pList[pPage-1].productStatus === 'AVAILABLE' &&
                                        <>
                                            <Card.Text>상태 : 판매중</Card.Text>
                                            <Button variant="dark" onClick={changeProductStatus}>판매 중지</Button>
                                        </>
                                        }
                                        
                                        {pList[pPage-1].productStatus === 'UNAVAILABLE' &&
                                        <>
                                            <Card.Text>상태 : 판매 중지</Card.Text>
                                            <Button variant="primary" onClick={changeProductStatus}>판매 재개</Button>
                                        </>
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
                                    <>
                                        <br />
                                        <Card.Text className='text-center'>등록한 제품이 없습니다.</Card.Text>
                                        <br />
                                    </>
                                }
                            </Tab>


                            <Tab eventKey="order" title="주문한 상품">

                                {oList.length > 0
                                ?
                                    <>
                                        <Card.Text>주문 번호 : {oList[oPage-1].id}</Card.Text>
                                        <Card.Text>주문 수량 : {oList[oPage-1].quantity}</Card.Text>
                                        <Card.Text>주문 상태 : {oList[oPage-1].orderStatus}</Card.Text>
                                        
                                        {oList[oPage-1].product !== null ?
                                            <>
                                                <Card.Text>제품 번호 : {oList[oPage-1].product.id}</Card.Text>
                                                <Card.Text>제품 이름 : {oList[oPage-1].product.name}</Card.Text>
                                                <Card.Text>제품 분류 : {oList[oPage-1].product.category}</Card.Text>
                                                <Card.Text>현재 재고 : {oList[oPage-1].product.stockQuantity}</Card.Text>
                                            </>
                                        :
                                            <Card.Text>해당 제품은 삭제되었습니다.</Card.Text>
                                        }

                                        {oList[oPage-1].orderStatus !== 'CANCELED'
                                        &&
                                        <>
                                            <Button onClick={orderCancel} variant='primary'>주문 취소</Button>
                                            <br />
                                            <br />
                                        </>
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
                                    <>
                                        <br />
                                        <Card.Text className='text-center'>주문한 제품이 없습니다.</Card.Text>
                                        <br />
                                    </>
                                }
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default MyPage;