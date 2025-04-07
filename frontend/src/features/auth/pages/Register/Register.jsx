// Add useState import
import React, {useState} from 'react';
// Import useAuth
import {useAuth} from '@features/auth/hooks/AuthContext';
import {usePasswordStrength, useRegisterFormState} from '@features/auth/hooks/register-hook.jsx';
import './Register.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';
import Form from '@shared/components/UIElement/Form/Form';
import {useNavigate} from "react-router";

// Remove props: isOpen, onSubmit, isLoading, apiError
function Register() {
    // --- Use Auth Context ---
    const {register, isLoading} = useAuth(); // Get register function and loading state

    // --- Local State for API Error ---
    const [localApiError, setLocalApiError] = useState(null);

    // --- Use Navigate Hook ---
    const navigate = useNavigate();

    // --- Use Register Form Hook ---
    // Pass `true` for isOpen, and the localApiError state for apiError
    const {
        fullName, setFullName,
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        agreeTerms, setAgreeTerms,
        formErrors, setFormErrors
    } = useRegisterFormState(true, localApiError); // Pass localApiError here

    // --- Use Password Strength Hook ---
    const {passwordStrength, checkPasswordStrength} = usePasswordStrength();

    // --- Handle Change (No changes needed) ---
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        // Clear local API error display when user types in any field
        if (localApiError) {
            setLocalApiError(null);
        }

        switch (name) {
            case 'fullName':
                setFullName(newValue);
                break;
            case 'username':
                setUsername(newValue);
                break;
            case 'email':
                setEmail(newValue);
                break;
            case 'password':
                setPassword(newValue);
                checkPasswordStrength(newValue);
                break;
            case 'confirmPassword':
                setConfirmPassword(newValue);
                break;
            case 'agreeTerms':
                setAgreeTerms(newValue);
                break;
            default:
                break;
        }

        // Clear specific field error on change
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({...prevErrors, [name]: null}));
        }
        if (formErrors.general) {
            setFormErrors(prevErrors => ({...prevErrors, general: null}));
        }
    };


    // --- Validate Form ---
    const validateForm = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        if (!agreeTerms) newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';

        setFormErrors(newErrors); // Update formErrors with validation results
        return Object.keys(newErrors).length === 0;
    }

    // --- Handle Submit ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalApiError(null); // Clear previous API error before attempting submission

        // Validate form before submission
        if (validateForm()) {
            const userData = {
                fullName,
                username,
                email,
                password
            };
            // Call the register function from AuthContext
            const result = await register(userData);

            if (!result.success) {
                setLocalApiError(result.message || 'Đăng ký không thành công.');
            } else {
                // Registration successful!
                console.log('Registration successful:', result.user);
                setFullName('');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setAgreeTerms(false);
                setFormErrors({});

                // Redirect to login page
                navigate('/login'); // Redirect to login page
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Vui lòng điền thông tin để tạo tài khoản mới</p>
                </div>

                {/* Display general error (now includes API errors via localApiError -> hook) */}
                {formErrors.general && <div className="alert alert-danger mb-3">{formErrors.general}</div>}

                <Form id="register-form" onSubmit={handleSubmit} mainClass="register-form">
                    {/* === Full Name === */}
                    <div className="form-group">
                        <Input
                            id="registerFullName" name="fullName" label="Họ và tên"
                            placeholder="Nhập họ và tên" value={fullName} onChange={handleChange}
                            isInvalid={!!formErrors.fullName} feedback={formErrors.fullName}
                            addon={<Icon name="user" size="16"/>}
                            disabled={isLoading} // Use isLoading from useAuth
                        />
                    </div>
                    {/* === Username === */}
                    <div className="form-group">
                        <Input
                            id="registerUsername" name="username" label="Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập" value={username} onChange={handleChange}
                            isInvalid={!!formErrors.username} feedback={formErrors.username}
                            addon={<Icon name="user" size="16"/>}
                            disabled={isLoading} // Use isLoading from useAuth
                        />
                    </div>
                    {/* === Email === */}
                    <div className="form-group">
                        <Input
                            id="registerEmail" name="email" type="email" label="Email"
                            placeholder="Nhập địa chỉ email" value={email} onChange={handleChange}
                            isInvalid={!!formErrors.email} feedback={formErrors.email}
                            addon={<Icon name="envelope" size="16"/>}
                            disabled={isLoading} // Use isLoading from useAuth
                        />
                    </div>
                    {/* === Password === */}
                    <div className="form-group">
                        <Input
                            id="registerPassword" name="password" type="password" label="Mật khẩu"
                            placeholder="Nhập mật khẩu" value={password} onChange={handleChange}
                            isInvalid={!!formErrors.password} feedback={formErrors.password}
                            addon={<Icon name="lock" size="16"/>}
                            disabled={isLoading} // Use isLoading from useAuth
                        />
                        {password && ( /* Password strength UI */
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className={`strength-level strength-${passwordStrength.score}`}
                                        style={{width: `${(passwordStrength.score / 4) * 100}%`}}
                                    ></div>
                                </div>
                                <span className="strength-text">{passwordStrength.message}</span>
                            </div>
                        )}
                    </div>
                    {/* === Confirm Password === */}
                    <div className="form-group">
                        <Input
                            id="registerConfirmPassword" name="confirmPassword" type="password"
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={handleChange}
                            isInvalid={!!formErrors.confirmPassword} feedback={formErrors.confirmPassword}
                            addon={<Icon name="lock" size="16"/>}
                            disabled={isLoading} // Use isLoading from useAuth
                        />
                    </div>
                    {/* === Agree Terms === */}
                    <div className="form-group checkbox-group">
                        <div className="checkbox-container">
                            <input
                                type="checkbox" id="registerAgreeTerms" name="agreeTerms"
                                checked={agreeTerms} onChange={handleChange}
                                className={formErrors.agreeTerms ? 'is-invalid' : ''}
                                disabled={isLoading} // Use isLoading from useAuth
                            />
                            <label htmlFor="registerAgreeTerms">
                                Tôi đồng ý với&nbsp;
                                <a
                                    href="/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="terms-link">
                                    điều khoản dịch vụ
                                </a>
                                &nbsp;và&nbsp;
                                <a
                                    href="/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="terms-link">
                                    chính sách bảo mật
                                </a>
                            </label>
                        </div>
                        {formErrors.agreeTerms &&
                            <div className="invalid-feedback d-block">{formErrors.agreeTerms}</div>}
                    </div>
                    {/* === Submit Button === */}
                    <Button
                        type="submit"
                        mainClass="register-button w-100"
                        disabled={isLoading} // Use isLoading from useAuth
                    >
                        {/* Use isLoading from useAuth */}
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </Form>

                <div className="register-footer mt-3">
                    <div className="d-flex justify-content-center align-items-center">
                        <span className="footer-text">
                            Đã có tài khoản?
                        </span>
                        <Button
                            contentType="text"
                            type="button"
                            mainClass="login-link"
                            addClass="p-0"
                            onClick={() => {
                                navigate('/login');
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;