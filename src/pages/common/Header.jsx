import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {

    const navi = useNavigate();     // navigate
    const[isAdmin, setIsAdmin] = useState(false);

    // 사용자가 admin인지 확인
    // 403 => 사용자가 권한 없음 => user
    useEffect(() => {
        
        if(localStorage.getItem("accessToken") !== null) {

            fetch(`http://localhost:8081/member/admin`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            })
            .then((res) => {

                if(res.ok) {
                    setIsAdmin(true);

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
                } else if(res.status === 403) {

                    // 권한이 없는 사용자 => USER
                    setIsAdmin(false);
                    console.clear();

                } else {
                    console.log("에러 발생");
                }
            })
            .catch((err) => console.log(err));
        } else {

            setIsAdmin(false);
        }
    }, [localStorage.getItem("accessToken")]);

    // 사용자 이용 가능 상태 확인
    useEffect(() => {

        // removeItem했는데 localStorage.getItem("accessToken")이 해당 값을 가지고 있음
        if(localStorage.getItem("accessToken") !== null) {
            
            fetch(`http://localhost:8081/member/memberStatus`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            })
            .then((res) => {

                if(res.status === 401) {
                    
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

                } else if(res.status === 403) {
                    alert("당신은 강제 퇴장되셨습니다.");

                    handleLogout();

                    console.clear();
                }
            });
        }
    });

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

    // 로그아웃
    const handleLogout = async() => {

        try {
            const res = await fetch(`http://localhost:8081/member/logout`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json;charset=utf-8"
                },
                credentials: "include",
                body: JSON.stringify({ 'refreshToken' : localStorage.getItem("refreshToken") })
            });

            if(!res.ok) console.log("로그아웃 문제 발생");

            // token 삭제
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("id");

            // header 로그아웃 상태로 전환
            navi("/");

        } catch {
            alert("로그아웃 에러 발생");
        }
    }

    return (
        <Navbar expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#">제품관리</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll"/>
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        navbarScroll
                    >

                        {localStorage.getItem("accessToken") !== null ?
                        (
                            <>
                                <Link to="/product/create" className="nav-link">제품등록</Link>
                                <Link to="/product/list" className="nav-link">제품목록</Link>
                                <Link to="/member/mypage" className="nav-link">마이페이지</Link>

                                {isAdmin &&
                                    <Link to="/member/list" className="nav-link">멤버보기</Link>
                                }

                                <Link onClick={handleLogout} className="nav-link">로그아웃</Link>
                            </>
                        )
                        :
                        (
                            <>
                                <Link to="/member/signup" className="nav-link">회원가입</Link>
                                <Link to="/member/login" className="nav-link">로그인</Link>
                                <Link to="/product/list" className="nav-link">제품목록</Link>
                            </>
                        )
                        }

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;