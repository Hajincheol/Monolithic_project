import React, { useEffect, useState } from 'react';
import MemberInfoItem from './MemberInfoItem';
import { Container, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MemberList = () => {

    const navi = useNavigate();
    const[member, setMember] = useState([]);
    const[page, setPage] = useState(1);

    // 모든 멤버 정보 가져오기
    useEffect(() => {
        
        fetch(`http://localhost:8081/member/list`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
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
            } else if(res.status === 403) {

                // 권한이 없는 사용자 => USER
                alert("해당 사용자는 이 페이지에 들어오실 수 없습니다.");
                navi("/member/mypage");
            }

            return null;
        })
        .then((res) => {

            if(res !== null) {
                setMember(res);
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

    return (
        <div>
            <br />
            <br />
            <Container style={{ maxWidth: '50rem' }}>
                {member.length > 0 &&
                    member.slice(page*5-5, page*5)
                    .map(m => 
                        <div key={m.id}>
                            <MemberInfoItem member={m} />
                            <br />
                        </div>
                    )
                }

                <br />
                <br />
                <Pagination className='d-flex justify-content-center'>
                    {page > 2 ? <Pagination.First onClick={() => setPage(1)} /> : <Pagination.First disabled/>}
                    {page > 1 ? <Pagination.Prev onClick={() => setPage(page-1)} /> : <Pagination.Prev disabled/>}
                    {page > 2 && <Pagination.Item onClick={() => setPage(page-2)}>{page-2}</Pagination.Item>}
                    {page > 1 && <Pagination.Item onClick={() => setPage(page-1)}>{page-1}</Pagination.Item>}
                    

                    <Pagination.Item active>{page}</Pagination.Item>


                    {page*5 < member.length && <Pagination.Item onClick={() => setPage(page+1)}>{page+1}</Pagination.Item>}
                    {page*5 < member.length-1 && <Pagination.Item onClick={() => setPage(page+2)}>{page+2}</Pagination.Item>}
                    {page*5 < member.length ? <Pagination.Next onClick={() => setPage(page+1)} /> : <Pagination.Next disabled />}
                    {page*5 < member.length-1 ? <Pagination.Last onClick={() => setPage(Math.ceil(member.length/5))} /> : <Pagination.Last disabled />}
                </Pagination>
            </Container>
        </div>
    );
};

export default MemberList;