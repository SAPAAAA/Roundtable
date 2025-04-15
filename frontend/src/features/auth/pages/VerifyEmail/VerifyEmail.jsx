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
        <div className="verify-email-container d-flex flex-column align-items-center justify-content-center min-vh-100 position-relative overflow-hidden">
            <div className="verify-email-background position-absolute top-0 start-0 w-100 h-100">
                <div className="verify-email-shape shape-1"></div>
                <div className="verify-email-shape shape-2"></div>
                <div className="verify-email-shape shape-3"></div>
                <div className="verify-email-shape shape-4"></div>
                <div className="verify-email-shape shape-5"></div>
                <div className="verify-email-shape shape-6"></div>
                <div className="verify-email-shape shape-7"></div>
                <div className="verify-email-shape shape-8"></div>
                <div className="verify-email-shape shape-9"></div>
                <div className="verify-email-shape shape-10"></div>
            </div>

            <div className="card p-5 shadow-lg text-center" style={{ maxWidth: '500px', borderRadius: '15px', zIndex: 1 }}>
                <div className="card-body">
                   
                    <h1 className="card-title mb-3">Welcome to Roundtable!</h1>
                    <p className="card-text mb-4">Join the conversation by verifying your email. Please enter the 6-digit code sent to your email.</p>
                    <Form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
                        <div className="d-flex justify-content-center gap-3 mb-4">
                            {code.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    mainClass="form-control text-center"
                                    style={{ width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            ))}
                        </div>
                        <div className="d-flex justify-content-center">
                            <Button type="submit" mainClass="btn btn-primary btn-lg" style={{ borderRadius: '8px' }}>
                                Verify
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
