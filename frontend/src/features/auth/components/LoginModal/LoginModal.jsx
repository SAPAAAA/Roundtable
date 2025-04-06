import React from 'react';
import useLoginForm from '@features/auth/hooks/login-hook.jsx';

import Modal from "@shared/components/UIElement/Modal/Modal.jsx";
import Button from "@shared/components/UIElement/Button/Button.jsx";
import Form from "@shared/components/UIElement/Form/Form.jsx";
import Input from "@shared/components/UIElement/Input/Input.jsx";
import Icon from '@shared/components/UIElement/Icon/Icon';

export default function LoginModal(props) {
    const {
        isOpen,
        onClose,
        onSubmit,
        onSwitchToRegister,
        isLoading,
        authError
    } = props;

    const {email, setEmail, password, setPassword, error} = useLoginForm(isOpen, authError);

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(email, password);
    };

    return (
        <Modal
            id="login-modal"
            isOpen={isOpen}
            onClose={onClose}
            footer={
                <div className="d-flex justify-content-center align-items-center">
                        <span className="footer-text">
                            Chưa có tài khoản?
                        </span>
                    <Button
                        type="button"
                        mainClass="register-link"
                        contentType="text"
                        addClass="p-0"
                        onClick={onSwitchToRegister}
                        disabled={isLoading}
                    >
                        Đăng ký
                    </Button>
                </div>
            }
        >
            <div className="login-header">
                <h1>Đăng nhập</h1>
                <p>Vui lòng nhập thông tin để đăng nhập</p>
            </div>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
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
                        placeholder="Nhập tên đăng nhập"
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
                <Button type="submit" className="login-button w-100" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
            </Form>
        </Modal>
    );
};