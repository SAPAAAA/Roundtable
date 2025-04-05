import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './Login.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Icon from '@shared/components/UIElement/Icon/Icon';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);

            setTimeout(() => {
                console.log('Đăng nhập với thông tin:', formData);
                setIsLoading(false);
                alert('Đăng nhập thành công!');
            }, 1500);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Đăng nhập</h1>
                    <p>Vui lòng nhập thông tin để đăng nhập</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
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
                    </div>

                    <Button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </Button>
                </form>

                <div className="login-footer">
                    <p>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="register-link">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
