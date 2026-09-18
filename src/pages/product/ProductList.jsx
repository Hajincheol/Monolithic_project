import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Pagination } from 'react-bootstrap';
import ProductItem from './ProductItem';
import { useNavigate, useParams } from 'react-router-dom';

const ProductList = () => {

    const[pList, setPList] = useState([]);  // product list
    const[pName, setPName] = useState('');
    const[page, setPage] = useState(1);
    const navi = useNavigate();

    // 모든 product 정보 가져오기
    useEffect(() => {

        fetch(`http://localhost:8081/product/list`, {
            method: "POST"
        })
        .then((res) => {
            
            if(res.ok) {
                return res.json();
                
            } else {
                return null;
            }
        })
        .then((res) => {

            if(res !== null) {
                setPList(res);
            }

        })
        .catch((err) => console.log(err));
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

    // 제품 이름으로 검색
    const selectProductName = async(e) => {

        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:8081/product/selectByName/${pName}`, {
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
            alert("검색 실패");
        }
    }

    return (
        <div>
            <Container style={{ maxWidth: '50rem' }}>
                <br />
                <a
                    href=''
                    className="text-decoration-none text-dark"
                    onClick={() => window.location.reload()}
                >
                    <h1 className='text-center'>제품 목록</h1>
                </a>

                <br />
                <Form onSubmit={selectProductName}>
                    {/* gap-2 : flexbox 안에 요소 사이 간격 주기 => gap: 0.5rem; */}
                    <Form.Group className="mb-3 d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="제품 이름을 입력해 주세요."
                            className="flex-grow-1"
                            onChange={(e) => setPName(e.target.value)}
                            required
                        />
                        {/*
                            flex-shrink-0 : flexbox 안에 요소의 크기를 줄이지 않는 css => flex-shrink: 0;

                            text-nowrap : 텍스트 줄 바꿈 x => white-space: nowrap;
                        */}
                        <Button type="submit" className="primary text-nowrap flex-shrink-0">검색</Button>
                    </Form.Group>
                </Form>
        
                {pList.length > 0 ? 
                    pList.slice(page*5-5, page*5)
                    .map(product => 
                        <div key={product.id}>
                            <br />
                            <ProductItem product={product} />
                        </div>
                    )
                :
                    <Card>
                        <Card.Header className='text-center'>등록된 제품이 없습니다.</Card.Header>
                    </Card>
                }

                <br />
                <br />
                <Pagination className='d-flex justify-content-center'>
                    {page > 2 ? <Pagination.First onClick={() => setPage(1)} /> : <Pagination.First disabled/>}
                    {page > 1 ? <Pagination.Prev onClick={() => setPage(page-1)} /> : <Pagination.Prev disabled/>}
                    {page > 2 && <Pagination.Item onClick={() => setPage(page-2)}>{page-2}</Pagination.Item>}
                    {page > 1 && <Pagination.Item onClick={() => setPage(page-1)}>{page-1}</Pagination.Item>}
                    

                    <Pagination.Item active>{page}</Pagination.Item>


                    {page*5 < pList.length && <Pagination.Item onClick={() => setPage(page+1)}>{page+1}</Pagination.Item>}
                    {page*5 < pList.length-1 && <Pagination.Item onClick={() => setPage(page+2)}>{page+2}</Pagination.Item>}
                    {page*5 < pList.length ? <Pagination.Next onClick={() => setPage(page+1)} /> : <Pagination.Next disabled />}
                    {page*5 < pList.length-1 ? <Pagination.Last onClick={() => setPage(Math.ceil(pList.length / 5))} /> : <Pagination.Last disabled />}
                </Pagination>
            </Container>
        </div>
    );
};

export default ProductList;