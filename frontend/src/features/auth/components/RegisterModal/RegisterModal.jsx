// src/features/auth/components/RegisterModal/RegisterModal.jsx
import React, {useEffect, useState} from 'react';
import {useFetcher, useNavigate, useNavigation} from 'react-router'; // Ensure this is react-router-dom
import {usePasswordStrength, useRegisterFormState} from '#features/auth/hooks/register-hook.jsx';

import Modal from "#shared/components/UIElement/Modal/Modal";
import Button from "#shared/components/UIElement/Button/Button";
import Form from '#shared/components/UIElement/Form/Form.jsx'; // Your custom Form
import Input from "#shared/components/UIElement/Input/Input";
import Icon from '#shared/components/UIElement/Icon/Icon';

import './RegisterModal.css';

export default function RegisterModal(props) {
    const {
        isOpen,
        onClose,
        onSwitchToLogin,
        onRegistrationSuccess, // New prop to handle success and pass email
    } = props;

    const fetcher = useFetcher(); // Use fetcher hook
    const actionData = fetcher.data; // Data from the action
    const navigation = useNavigation(); // For submission state
    const navigate = useNavigate();
    const isSubmitting = navigation.state === 'submitting' || fetcher.state === 'submitting';


    const [localApiError, setLocalApiError] = useState(null);
    const {
        // fullName, setFullName, // Removed fullName as it's not in Register.jsx
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        agreeTerms, setAgreeTerms,
        formErrors, setFormErrors
    } = useRegisterFormState(isOpen); // Removed apiError from hook call

    const {passwordStrength, checkPasswordStrength} = usePasswordStrength();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // setFullName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAgreeTerms(false);
            setFormErrors({});
            setLocalApiError(null);
            checkPasswordStrength(''); // Reset password strength
        }
    }, [isOpen])


    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        if (localApiError) setLocalApiError(null);
        if (formErrors[name]) setFormErrors(prev => ({...prev, [name]: null}));
        if (formErrors.general) setFormErrors(prev => ({...prev, general: null}));

        switch (name) {
            // case 'fullName': setFullName(newValue); break;
            case 'username':
                setUsername(newValue);
                break;
            case 'email':
                setEmail(newValue);
                break;
            case 'password':
                setPassword(newValue);
                checkPasswordStrength(newValue);
                // Re-validate confirmPassword if password changes
                if (confirmPassword) {
                    const confirmError = validateField('confirmPassword', confirmPassword, newValue);
                    setFormErrors(prev => ({...prev, confirmPassword: confirmError}));
                }
                break;
            case 'confirmPassword':
                setConfirmPassword(newValue);
                // Re-validate confirmPassword against current password
                const confirmError = validateField('confirmPassword', newValue, password);
                setFormErrors(prev => ({...prev, confirmPassword: confirmError}));
                break;
            case 'agreeTerms':
                setAgreeTerms(newValue);
                break;
            default:
                break;
        }
    };
    const validateField = (name, value, currentPassword) => {
        let error = null;
        switch (name) {
            case 'username':
                if (!value.trim()) error = 'Vui lòng nhập tên đăng nhập';
                break;
            case 'email':
                if (!value.trim()) error = 'Vui lòng nhập email';
                else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email không hợp lệ';
                break;
            case 'password':
                if (!value) error = 'Vui lòng nhập mật khẩu';
                else if (value.length < 6) error = 'Mật khẩu phải có ít nhất 6 ký tự';
                break;
            case 'confirmPassword':
                if (value !== currentPassword) error = 'Mật khẩu xác nhận không khớp';
                break;
            case 'agreeTerms':
                if (!value) error = 'Bạn phải đồng ý với điều khoản dịch vụ';
                break;
            default:
                break;
        }
        return error;
    };


    const validateForm = () => {
        const newErrors = {};
        // newErrors.fullName = validateField('fullName', fullName); // Removed
        newErrors.username = validateField('username', username);
        newErrors.email = validateField('email', email);
        newErrors.password = validateField('password', password);
        newErrors.confirmPassword = validateField('confirmPassword', confirmPassword, password);
        newErrors.agreeTerms = validateField('agreeTerms', agreeTerms);

        const filteredErrors = Object.entries(newErrors)
            .filter(([_, value]) => value !== null)
            .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

        setFormErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleSubmit = (event) => {
        setFormErrors({});
        setLocalApiError(null);
        if (!validateForm()) {
            event.preventDefault();
            console.log("Client validation failed in RegisterModal. Preventing submission.");
            return;
        }
        console.log("Client validation passed in RegisterModal. Allowing React Router submission via fetcher...");
        // Fetcher will handle the submission based on Form's method and action
    };

    useEffect(() => {
        if (actionData && isOpen) { // Process only if modal is open
            console.log("Register Modal actionData received:", actionData);
            if (actionData.success) {
                console.log('Registration successful (via actionData in modal):', actionData.data);
                if (onRegistrationSuccess) {
                    // Pass the email and potentially other data if needed by VerifyEmailModal
                    onRegistrationSuccess(actionData.data?.email || email);
                }
                onClose(); // Close RegisterModal
            } else {
                // Handle API errors or other validation messages from the action
                setLocalApiError(actionData.message || actionData.error?.message || 'Đăng ký không thành công.');
                // If your action returns field-specific errors:
                if (actionData.errors) {
                    setFormErrors(prev => ({...prev, ...actionData.errors}));
                }
            }
        }
    }, [actionData, isOpen, onClose, onRegistrationSuccess, email, setFormErrors]);


    return (
        <Modal
            id="register-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Đăng ký tài khoản"
            footer={
                <div className="d-flex justify-content-center align-items-center">
                    <span className="footer-text">
                        Đã có tài khoản?
                    </span>
                    <Button
                        contentType="text"
                        type="button"
                        mainClass="login-link"
                        addClass="p-0"
                        onClick={onSwitchToLogin}
                        disabled={isSubmitting}
                    >
                        Đăng nhập
                    </Button>
                </div>
            }
        >
            <div className="register-header">
                <h1>Đăng ký tài khoản</h1>
                <p>Vui lòng điền thông tin để tạo tài khoản mới</p>
            </div>
            <Form
                id="register-form-modal" // Unique ID for the modal form
                method="post"
                action="/register" // Make sure this matches your route for registerAction
                onSubmit={handleSubmit}
                mainClass="register-form"
                addClass="px-4"
                preventNavigation={true} // Use fetcher without page navigation
                fetcher={fetcher} // Pass the fetcher instance
            >
                {localApiError && <div className="alert alert-danger mb-3">{localApiError}</div>}
                {/* Removed fullName field as it's not in Register.jsx */}
                <div className="form-group">
                    <Input
                        id="registerModalUsername" name="username" label="Tên đăng nhập"
                        placeholder="Nhập họ và tên" value={username} onChange={handleChange}
                        isInvalid={!!formErrors.username} feedback={formErrors.username}
                        addonBefore={<Icon name="user" size="16"/>}
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="registerModalEmail" name="email" type="email" label="Email"
                        placeholder="Nhập địa chỉ email" value={email} onChange={handleChange}
                        isInvalid={!!formErrors.email} feedback={formErrors.email}
                        addonBefore={<Icon name="envelope" size="16"/>}
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="registerModalPassword" name="password" type="password" label="Mật khẩu"
                        placeholder="Nhập mật khẩu" value={password} onChange={handleChange}
                        isInvalid={!!formErrors.password} feedback={formErrors.password}
                        addonBefore={<Icon name="lock" size="16"/>}
                        disabled={isSubmitting}
                        required
                    />
                    {password && (
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
                <div className="form-group">
                    <Input
                        id="registerModalConfirmPassword" name="confirmPassword" type="password"
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={handleChange}
                        isInvalid={!!formErrors.confirmPassword} feedback={formErrors.confirmPassword}
                        addonBefore={<Icon name="lock" size="16"/>}
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <div className="form-group checkbox-group">
                    <div className="checkbox-container">
                        <input
                            type="checkbox" id="registerModalAgreeTerms" name="agreeTerms"
                            checked={agreeTerms} onChange={handleChange}
                            className={`form-check-input ${formErrors.agreeTerms ? 'is-invalid' : ''}`}
                            disabled={isSubmitting}
                            required
                        />
                        <label htmlFor="registerModalAgreeTerms">
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

                <Button
                    type="submit"
                    mainClass="register-button w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
            </Form>
        </Modal>
    );
}