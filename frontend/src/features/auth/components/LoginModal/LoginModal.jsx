import React, {useEffect, useState} from 'react';
// Remove RouterForm import, we will use the custom one
import {useActionData, useNavigation} from 'react-router';
import useLoginForm from '@features/auth/hooks/login-hook.jsx';

import Modal from "@shared/components/UIElement/Modal/Modal.jsx";
import Button from "@shared/components/UIElement/Button/Button.jsx";
// Import your custom Form component
import Form from '@shared/components/UIElement/Form/Form.jsx';
import Input from "@shared/components/UIElement/Input/Input.jsx";
import Icon from '@shared/components/UIElement/Icon/Icon';

import './LoginModal.css';

export default function LoginModal(props) {
    const {
        isOpen,
        onClose,
        onSwitchToRegister,
    } = props;

    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const {username, setUsername, password, setPassword} = useLoginForm(isOpen);
    const [apiError, setApiError] = useState(null);

    const handleUsernameChange = (e) => {
        if (apiError) setApiError(null);
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        if (apiError) setApiError(null);
        setPassword(e.target.value);
    };

    useEffect(() => {
        if (isOpen && actionData) {
            console.log("Login Modal actionData received:", actionData);
            if (actionData.success === true) {
                onClose();
            } else if (actionData.success === false) {
                setApiError(actionData.message || 'Đăng nhập không thành công.');
            } else {
                console.warn("Received unexpected actionData in LoginModal:", actionData);
                setApiError("Phản hồi từ máy chủ không hợp lệ.");
            }
        }
        if (!isOpen) {
            setApiError(null);
        }
    }, [actionData, isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setUsername('');
            setPassword('');
            setApiError(null);
        }
    }, [isOpen, setUsername, setPassword]);

    return (
        <Modal
            id="login-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Đăng nhập"
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
                        disabled={isSubmitting}
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
            {/* Use your custom Form component */}
            <Form
                method="post"
                action="/login"
                mainClass="login-form" // Use mainClass/addClass as defined by your component
                addClass="px-4"
                // onSubmit is not needed here unless specific client validation exists
            >
                {apiError && <div className="alert alert-danger mb-3">{apiError}</div>}

                <div className="form-group">
                    <Input
                        id="loginModalUsername"
                        type="text"
                        label="Tên đăng nhập"
                        name="username"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                        disabled={isSubmitting}
                        addon={<Icon name="user" size="16"/>}
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="loginModalPassword"
                        name="password"
                        type="password"
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        disabled={isSubmitting}
                        addon={<Icon name="lock" size="16"/>}
                    />
                </div>
                <Button
                    type="submit"
                    mainClass="login-button w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
            </Form>
        </Modal>
    );
};