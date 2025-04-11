import {useAuth} from '@hooks/useAuth.jsx';
import useLoginForm from '@features/auth/hooks/login-hook.jsx';
import './Login.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';
import Form from '@shared/components/UIElement/Form/Form';
import {useNavigate} from "react-router";

// Remove props: isOpen, onSubmit, isLoading, authError
function Login() {
    const navigate = useNavigate();

    const {login, isLoading, error: authError} = useAuth();
    const {email, setEmail, password, setPassword} = useLoginForm(true, authError); // Remove this line

    // --- Handle Submit ---
    const handleSubmit = async (event) => { // Make async if you want to await the login result
        event.preventDefault();
        await login(email, password);

        // Redirect to home page after successful login
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Đăng nhập</h1>
                    <p>Vui lòng nhập thông tin để đăng nhập</p>
                </div>
                {/* Use the error state from the AuthContext */}
                {authError && <div className="alert alert-danger mb-3">{authError}</div>}
                <Form
                    id="login-form"
                    onSubmit={handleSubmit}
                    mainClass="login-form"
                    addClass="px-4"
                >
                    <div className="form-group">
                        <Input
                            id="loginUsername"
                            type="text"
                            label="Tên đăng nhập"
                            placeholder="Nhập email của bạn"
                            value={email} // Use local state
                            onChange={(e) => setEmail(e.target.value)} // Use local setter
                            required
                            disabled={isLoading} // Use isLoading from context
                            addon={<Icon name="user" size="16"/>}
                        />
                    </div>
                    <div className="form-group">
                        <Input
                            id="loginPassword"
                            type="password"
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            value={password} // Use local state
                            onChange={(e) => setPassword(e.target.value)} // Use local setter
                            required
                            disabled={isLoading} // Use isLoading from context
                            addon={<Icon name="lock" size="16"/>}
                        />
                    </div>
                    <Button
                        type="submit"
                        mainClass="login-button"
                        disabled={isLoading} // Use isLoading from context
                    >
                        {/* Use isLoading from context */}
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
        </div>
    );
}

export default Login;