import React from 'react';
import { useAuth } from '@hooks/useAuth.jsx';
import useLoginForm from '@features/auth/hooks/login-hook.jsx';
import './Login.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Form from '@shared/components/UIElement/Form/Form';
import { useNavigate } from "react-router";
import Icon from '@shared/components/UIElement/Icon/Icon';

function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error: authError } = useAuth();
    const { email, setEmail, password, setPassword } = useLoginForm(true, authError);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(email, password);
            navigate('/'); // Redirect to home page on success
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="login-form-container">
            <h1>Đăng nhập</h1>
            <p>Vui lòng nhập thông tin để đăng nhập</p>
            
            {authError && <div className="alert alert-danger mb-3">{authError}</div>}
            
            <Form
                id="login-form"
                onSubmit={handleSubmit}
                mainClass="login-form"
            >
                <div className="form-group">
                    <Input
                        id="loginUsername"
                        type="text"
                        label="Tên đăng nhập"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        addon={<Icon name="user" size="16"/>}
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="loginPassword"
                        type="password"
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        addon={<Icon name="lock" size="16"/>}
                    />
                </div>
                <Button
                    type="submit"
                    mainClass="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
            </Form>
            
            <div className="login-footer mt-3">
                <div className="d-flex justify-content-center align-items-center">
                    <span className="footer-text">
                        Chưa có tài khoản?
                    </span>
                    <Button
                        type="button"
                        mainClass="register-link"
                        contentType="text"
                        addClass="p-0"
                        onClick={() => {
                            navigate('/register');
                        }}
                    >
                        Đăng ký
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Login;