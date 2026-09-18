import React, { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

    // 아이디, 비밀번호 정규식
    const regEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regPassword =  /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    const navi = useNavigate();
    const[email, setEmail] = useState('');
    const[data, setData] = useState({
        'name': '',
        'email': '',
        'password': ''
    });

    const changeValue = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    }

    const memberSignup = async(e) => {

        e.preventDefault();

        if(!regEmail.test(data.email + email)) {
            alert("이메일 형식이 잘못 되었습니다.");
            return;
        } else if(!regPassword.test(data.password)) {
            alert("비밀번호 입력(문자, 특수문자, 숫자 포함 형태의 8~15글자)!!");
            return;
        } else if(data.name.length >= 4) {
            alert("닉네임을 4글자 이상 적어주세요.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8081/member/create`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json;charset=utf-8"
                },
                credentials: "include",
                body: JSON.stringify({...data, 'email': data.email + email})
            });

            if(!res.ok) {
                alert("통신 실패");
                return;
            }

            alert("회원가입 성공");
            navi("/");

        } catch {
            alert('회원가입 실패');
        }
    }

    return (
        <div>
            <br />
            <br />
            <Container style={{ maxWidth: "40rem" }}>
                <Card>
                    <Card.Body>
                        <Card.Title className="text-center">회원가입</Card.Title>

                        <Form onSubmit={memberSignup}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>이름</Form.Label>
                                <Form.Control
                                    name="name"
                                    type="text"
                                    placeholder="이름을 입력해 주세요."
                                    onChange={changeValue}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>이메일</Form.Label>
                                <div className="d-flex gap-2" name="email">
                                    <Form.Control
                                        name="email"
                                        type="text"
                                        placeholder="이메일을 입력해 주세요."
                                        onChange={changeValue}
                                        style={{ width: "65%" }}
                                        required
                                    />
                                    <Form.Select
                                        aria-label="Default select example"
                                        style={{ width: "35%" }}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    >
                                        <option hidden>분류를 골라주세요.</option>
                                        <option value="@daum.com">@daum.com</option>
                                        <option value="@naver.com">@naver.com</option>
                                        <option value="@gmail.com">@gmail.com</option>
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>비밀번호</Form.Label>
                                <Form.Control
                                    name="password"
                                    type="password"
                                    placeholder="비밀번호을 입력해 주세요."
                                    onChange={changeValue}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">회원가입</Button>
                            {' '}
                            <Button variant="danger" type="reset">초기화</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default SignUp;