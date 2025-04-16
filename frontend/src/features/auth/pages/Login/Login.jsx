import useLoginForm from '@features/auth/hooks/login-hook.jsx';
import './Login.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';
import Form from '@shared/components/UIElement/Form/Form';
import {useActionData, useNavigate, useNavigation} from "react-router";
import {useEffect, useState} from "react";

function Login() {
    const navigate = useNavigate();
    const actionData = useActionData();
    const navigation = useNavigation();

    const [error, setError] = useState(null);

    const {username, setUsername, password, setPassword} = useLoginForm(true, null);

    useEffect(() => {
        if (actionData && actionData.success) {
            // Handle successful login
            navigate('/', {
                replace: true,
                user: actionData.user,
            });
        }
        if (!actionData.success) {
            console.log(actionData);
            setError(actionData.message);
        }
    }, [actionData, navigate]);

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Đăng nhập</h1>
                    <p>Vui lòng nhập thông tin để đăng nhập</p>
                </div>
                {/* Use the error state from the AuthContext */}
                {/* Check if actionData exists first */}
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <Form
                    id="login-form"
                    method="post"
                    action="/login"
                    mainClass="login-form"
                    addClass="px-4"
                >
                    <div className="form-group">
                        <Input
                            id="loginUsername"
                            type="text"
                            label="Tên đăng nhập"
                            name="username"
                            placeholder="Nhập tên đăng nhập"
                            value={username} // Use local state
                            onChange={(e) => setUsername(e.target.value)} // Use local setter
                            required
                            disabled={navigation.state === 'submitting'} // Use isLoading from context
                            addon={<Icon name="user" size="16"/>}
                        />
                    </div>
                    <div className="form-group">
                        <Input
                            id="loginPassword"
                            name="password"
                            type="password"
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            value={password} // Use local state
                            onChange={(e) => setPassword(e.target.value)} // Use local setter
                            required
                            disabled={navigation.state === 'submitting'} // Use isLoading from context
                            addon={<Icon name="lock" size="16"/>}
                        />
                    </div>
                    <Button
                        type="submit"
                        mainClass="login-button"
                        disabled={navigation.state === 'submitting'} // Use isLoading from context
                    >
                        {/* Use isLoading from context */}
                        {navigation.state === 'submitting' ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
        </div>
    );
}

export default Login;