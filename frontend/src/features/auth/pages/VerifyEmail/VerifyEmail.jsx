import React, { useState } from 'react';
import './VerifyEmail.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Form from '@shared/components/UIElement/Form/Form';
import { useNavigate } from "react-router";

function VerifyEmail() {
    const navigate = useNavigate();
    const [code, setCode] = useState(Array(6).fill(''));

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^\d$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (index < 5) {
                document.getElementById(`code-${index + 1}`).focus();
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Verification code entered: ${code.join('')}`);
        navigate('/');
    };

    return (
        <div className="verify-email-form-container">
            <h1>Welcome to Roundtable!</h1>
            <p>Join the conversation by verifying your email. Please enter the 6-digit code sent to your email.</p>
            
            <Form onSubmit={handleSubmit} mainClass="verify-email-form">
                <div className="verification-code-container">
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            mainClass="verification-input"
                        />
                    ))}
                </div>
                <Button type="submit" mainClass="verification-button">
                    Verify
                </Button>
            </Form>
            
            <div className="verify-email-footer mt-3">
                <Button
                    type="button"
                    mainClass="back-link"
                    contentType="text"
                    onClick={() => navigate('/login')}
                >
                    Back to Login
                </Button>
            </div>
        </div>
    );
}

export default VerifyEmail;