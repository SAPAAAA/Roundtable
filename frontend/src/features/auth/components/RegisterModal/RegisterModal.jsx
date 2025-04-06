import React from 'react';
import {usePasswordStrength, useRegisterFormState} from '@features/auth/hooks/register-hook.jsx';

import Modal from "@shared/components/UIElement/Modal/Modal";
import Button from "@shared/components/UIElement/Button/Button";
import Form from "@shared/components/UIElement/Form/Form";
import Input from "@shared/components/UIElement/Input/Input";
import Icon from '@shared/components/UIElement/Icon/Icon';

export default function RegisterModal(props) {
    const {
        isOpen,
        onClose,
        onSubmit,
        onSwitchToLogin,
        isLoading,
        apiError
    } = props;

    const {
        fullName,
        setFullName,
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        agreeTerms,
        setAgreeTerms,
        formErrors,
        setFormErrors
    } = useRegisterFormState(isOpen, apiError);

    const {passwordStrength, checkPasswordStrength} = usePasswordStrength();

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const newValue = type === 'checkbox' ? checked : value;

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

        if (formErrors[name]) {
            setFormErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
        if (formErrors.general) {
            setFormErrors(prevErrors => ({
                ...prevErrors,
                general: ''
            }));
        }
    };

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
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            const userData = {
                fullName,
                username,
                email,
                password
            };
            onSubmit(userData);
        }
    };

    return (
        <Modal
            id="register-modal"
            isOpen={isOpen}
            onClose={onClose}
            footer={
                <div className="d-flex justify-content-center align-items-center">
                    Đã có tài khoản?
                    <Button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="login-link btn btn-link p-0"
                        disabled={isLoading}
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

            {formErrors.general && <div className="alert alert-danger mb-3">{formErrors.general}</div>}

            <Form
                id="register-form-modal"
                onSubmit={handleSubmit}
                mainClass="register-form"
                addClass="px-4"
            >
                <div className="form-group">
                    <Input
                        id="registerFullName"
                        name="fullName"
                        label="Họ và tên"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={handleChange}
                        isInvalid={!!formErrors.fullName}
                        feedback={formErrors.fullName}
                        addon={<Icon name="user" size="16"/>}
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="registerUsername"
                        name="username"
                        label="Tên đăng nhập"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={handleChange}
                        isInvalid={!!formErrors.username}
                        feedback={formErrors.username}
                        addon={<Icon name="user" size="16"/>}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <Input
                        id="registerEmail"
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Nhập địa chỉ email"
                        value={email}
                        onChange={handleChange}
                        isInvalid={!!formErrors.email}
                        feedback={formErrors.email}
                        addon={<Icon name="envelope" size="16"/>}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <Input
                        id="registerPassword"
                        name="password"
                        type="password"
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={handleChange}
                        isInvalid={!!formErrors.password}
                        feedback={formErrors.password}
                        addon={<Icon name="lock" size="16"/>}
                        disabled={isLoading}
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
                        id="registerConfirmPassword"
                        name="confirmPassword"
                        type="password"
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.confirmPassword}
                        feedback={formErrors.confirmPassword}
                        addon={<Icon name="lock" size="16"/>}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group checkbox-group">
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="registerAgreeTerms"
                            name="agreeTerms"
                            checked={agreeTerms}
                            onChange={handleChange}
                            className={formErrors.agreeTerms ? 'is-invalid' : ''}
                            disabled={isLoading}
                        />
                        <label htmlFor="registerAgreeTerms">
                            Tôi đồng ý với <a href="/terms" target="_blank" rel="noopener noreferrer"
                                              className="terms-link">điều khoản dịch vụ</a> và <a href="/privacy"
                                                                                                  target="_blank"
                                                                                                  rel="noopener noreferrer"
                                                                                                  className="terms-link">chính
                            sách bảo mật</a>
                        </label>
                    </div>
                    {formErrors.agreeTerms && <div className="invalid-feedback d-block">{formErrors.agreeTerms}</div>}
                </div>

                <Button
                    type="submit"
                    className="register-button w-100"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
            </Form>
        </Modal>
    );
};