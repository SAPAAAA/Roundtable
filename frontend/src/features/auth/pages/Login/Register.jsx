import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './Register.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';

function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ''
    });

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        let message = '';

        if (password.length < 6) {
            message = 'Yếu';
        } else {
            if (password.length >= 8) score += 1;
            if (/[A-Z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[^A-Za-z0-9]/.test(password)) score += 1;

            if (score <= 1) message = 'Yếu';
            else if (score === 2) message = 'Trung bình';
            else if (score === 3) message = 'Khá mạnh';
            else message = 'Mạnh';
        }

        setPasswordStrength({score, message});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);

            setTimeout(() => {
                console.log('Đăng ký với thông tin:', formData);
                setIsLoading(false);
                alert('Đăng ký thành công!');
            }, 1500);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Vui lòng điền thông tin để tạo tài khoản mới</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <Input
                            id="fullName"
                            label="Họ và tên"
                            placeholder="Nhập họ và tên"
                            value={formData.fullName}
                            onChange={handleChange}
                            isInvalid={!!errors.fullName}
                            feedback={errors.fullName}
                            addon={<Icon name="user" size="16"/>}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="username"
                            label="Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập"
                            value={formData.username}
                            onChange={handleChange}
                            isInvalid={!!errors.username}
                            feedback={errors.username}
                            addon={<Icon name="user" size="16"/>}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="Nhập địa chỉ email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            feedback={errors.email}
                            addon={<Icon name="envelope" size="16"/>}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="password"
                            type="password"
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            feedback={errors.password}
                            addon={<Icon name="lock" size="16"/>}
                        />
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className={`strength-level strength-${passwordStrength.score}`}
                                        style={{width: `${25 * passwordStrength.score}%`}}
                                    ></div>
                                </div>
                                <span className="strength-text">{passwordStrength.message}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                            feedback={errors.confirmPassword}
                            addon={<Icon name="lock" size="16"/>}
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                            />
                            <label htmlFor="agreeTerms">
                                Tôi đồng ý với <a href="#" className="terms-link">điều khoản dịch vụ</a> và <a href="#"
                                                                                                               className="terms-link">chính
                                sách bảo mật</a>
                            </label>
                        </div>
                        {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
                    </div>

                    <Button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </form>

                <div className="register-footer">
                    <p>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="login-link">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;