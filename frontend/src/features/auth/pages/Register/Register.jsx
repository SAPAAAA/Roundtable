// Add/Update imports
import React, {useEffect, useState} from 'react'; // Add useEffect
import {usePasswordStrength, useRegisterFormState} from '@features/auth/hooks/register-hook.jsx';
import './Register.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';
import Form from '@shared/components/UIElement/Form/Form';
// Import hooks from react-router-dom
import {useActionData, useNavigate, useNavigation} from 'react-router';

function Register() {
    // --- Hooks ---
    const navigate = useNavigate();
    const actionData = useActionData(); // Hook to get data returned by the action endpoint
    const navigation = useNavigation(); // Hook to get form submission state

    // --- State ---
    const [localApiError, setLocalApiError] = useState(null); // For API errors from actionData

    // --- Loading State ---
    const isSubmitting = navigation.state === 'submitting'; // Use navigation state for loading indicator


    const {
        fullName, setFullName,
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        agreeTerms, setAgreeTerms,
        formErrors, setFormErrors
    } = useRegisterFormState(true, localApiError);

    const {passwordStrength, checkPasswordStrength} = usePasswordStrength();

    // --- Handle Change ---
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

        // Clear specific field validation error on change
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({...prevErrors, [name]: null}));
        }
        // Clear general validation error on change (if you use it)
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

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Handle Submit ---
    const handleSubmit = (event) => {
        // Print form data to console
        console.log("Form data before submission:", {
            // from the actual form not the state
            fullName: event.target.fullName.value,
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value,
            confirmPassword: event.target.confirmPassword.value,
            agreeTerms: event.target.agreeTerms.checked
        });

        // Clear previous errors before validation
        setFormErrors({});
        setLocalApiError(null);

        // Validate form before letting React Router submit
        if (!validateForm()) {
            // If validation fails, STOP React Router's submission process
            event.preventDefault();
            console.log("Client validation failed. Preventing submission.");
            return; // Exit
        }
        console.log("Client validation passed. Allowing React Router submission...");
    };

    // --- Effect to Handle API Response via actionData ---
    useEffect(() => {
        if (actionData) {
            console.log("Action data received:", actionData);
            // Check the structure of the response from your API endpoint
            if (actionData.success === false) {
                // API returned a failure message
                setLocalApiError(actionData.message || 'Đăng ký không thành công.');
            } else if (actionData.success === true) {
                // Registration successful!
                console.log('Registration successful (via actionData):', actionData.user);
                // Clear the form fields
                setFullName('');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setAgreeTerms(false);
                setFormErrors({}); // Clear any validation errors
                setLocalApiError(null); // Clear API error state

                // Redirect to login page after successful registration
                // Optional: Show a success message briefly before redirecting
                navigate('/login');
            } else {
                // Handle cases where actionData might not have the expected structure
                console.warn("Received unexpected actionData:", actionData);
                setLocalApiError("Phản hồi từ máy chủ không hợp lệ.");
            }
        }
    }, [actionData, navigate, setFullName, setUsername, setEmail, setPassword, setConfirmPassword, setAgreeTerms, setFormErrors]); // Add setters to dependency array if needed by your ESLint rules

    // --- Render ---
    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Vui lòng điền thông tin để tạo tài khoản mới</p>
                </div>

                {/* Display API error first if it exists */}
                {/*{localApiError && <div className="alert alert-danger mb-3">{localApiError}</div>}*/}

                {formErrors.general && <div className="alert alert-danger mb-3">{formErrors.general}</div>}

                {/* === Form with method and action === */}
                <Form
                    id="register-form"
                    onSubmit={handleSubmit}
                    method="post"
                    action="/register"
                    mainClass="register-form"
                    // noValidate // Optional: disable browser's built-in validation UI
                >
                    {/* === Full Name === */}
                    <div className="form-group">
                        <Input
                            id="registerFullName" name="fullName" label="Họ và tên"
                            placeholder="Nhập họ và tên" value={fullName} onChange={handleChange}
                            isInvalid={!!formErrors.fullName} feedback={formErrors.fullName}
                            addon={<Icon name="user" size="16"/>}
                            disabled={isSubmitting}
                        />
                    </div>
                    {/* === Username === */}
                    <div className="form-group">
                        <Input
                            id="registerUsername" name="username" label="Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập" value={username} onChange={handleChange}
                            isInvalid={!!formErrors.username} feedback={formErrors.username}
                            addon={<Icon name="user" size="16"/>}
                            disabled={isSubmitting}
                        />
                    </div>
                    {/* === Email === */}
                    <div className="form-group">
                        <Input
                            id="registerEmail" name="email" type="email" label="Email"
                            placeholder="Nhập địa chỉ email" value={email} onChange={handleChange}
                            isInvalid={!!formErrors.email} feedback={formErrors.email}
                            addon={<Icon name="envelope" size="16"/>}
                            disabled={isSubmitting}
                        />
                    </div>
                    {/* === Password === */}
                    <div className="form-group">
                        <Input
                            id="registerPassword" name="password" type="password" label="Mật khẩu"
                            placeholder="Nhập mật khẩu" value={password} onChange={handleChange}
                            isInvalid={!!formErrors.password} feedback={formErrors.password}
                            addon={<Icon name="lock" size="16"/>}
                            disabled={isSubmitting}
                        />
                        {password && (
                            <div className="password-strength">
                                {/* ... strength indicator ... */}
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
                            disabled={isSubmitting}
                        />
                    </div>
                    {/* === Agree Terms === */}
                    <div className="form-group checkbox-group">
                        <div className="checkbox-container">
                            <input
                                type="checkbox" id="registerAgreeTerms" name="agreeTerms"
                                checked={agreeTerms} onChange={handleChange}
                                className={formErrors.agreeTerms ? 'is-invalid' : ''}
                                disabled={isSubmitting}
                            />
                            <label htmlFor="registerAgreeTerms">
                                Tôi đồng ý với&nbsp;
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
                                    điều khoản dịch vụ
                                </a>
                                &nbsp;và&nbsp;
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="terms-link">
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
                        disabled={isSubmitting}
                    >
                        {/* Use isSubmitting state for button text */}
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </Form>

                {/* --- Footer (Login Link) --- */}
                <div className="register-footer mt-3">
                    <div className="d-flex justify-content-center align-items-center">
                        <span
                            className="footer-text">
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