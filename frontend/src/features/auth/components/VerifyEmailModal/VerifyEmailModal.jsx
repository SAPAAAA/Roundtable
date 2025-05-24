import React, {useEffect, useState} from 'react';
import {useFetcher, useNavigate, useNavigation} from 'react-router';
import Modal from '#shared/components/UIElement/Modal/Modal';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Form from '#shared/components/UIElement/Form/Form';
// Assuming similar CSS can be used or a new one can be created if needed.
// import './VerifyEmailModal.css'; // Create if specific styling is needed

function VerifyEmailModal({isOpen, onClose, emailToVerify, onVerificationSuccess}) {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const actionData = fetcher.data;
    const navigation = useNavigation(); // Changed from useNavigation
    const isSubmitting = navigation.state === 'submitting';

    const [code, setCode] = useState(Array(6).fill(''));
    const [errorMessage, setErrorMessage] = useState(null);

    const handleChange = (e, index) => {
        const {value} = e.target;
        if (/^\d?$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                document.getElementById(`modal-code-${index + 1}`)?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`modal-code-${index - 1}`)?.focus();
        }
    };

    const combinedCode = code.join('');

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                if (onVerificationSuccess) {
                    onVerificationSuccess(actionData.data.profileId); // Pass profileId
                }
                onClose(); // Close this modal
            } else {
                setErrorMessage(actionData.message || 'Verification failed. Please try again.');
            }
        }
    }, [actionData, onClose, onVerificationSuccess]);

    useEffect(() => {
        if (!isOpen) {
            setCode(Array(6).fill(''));
            setErrorMessage(null);
        }
    }, [isOpen]);

    const modalFooter = (
        <Button
            type="submit" // This button will submit the form
            form="verify-email-modal-form" // Associate with the form
            mainClass="btn btn-primary"
            disabled={combinedCode.length !== 6 || isSubmitting}
        >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
        </Button>
    );

    return (
        <Modal
            id="verify-email-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Verify Your Email"
            footer={modalFooter}
        >
            <p className="text-center">
                Please enter the 6-digit code sent to <strong>{emailToVerify}</strong>.
            </p>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <Form
                id="verify-email-modal-form"
                method="post"
                action="/verify-email" // Action route
                fetcher={fetcher} // Pass the fetcher
                preventNavigation={true} // Important for modals
            >
                <input type="hidden" name="email" value={emailToVerify || ''}/>
                <input type="hidden" name="code" value={combinedCode}/>
                <div className="d-flex justify-content-center gap-2 mb-4">
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            id={`modal-code-${index}`}
                            type="tel"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            mainClass="form-control text-center"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            style={{
                                width: '45px',
                                height: '50px',
                                fontSize: '1.2rem',
                                borderRadius: '8px',
                                border: '1px solid #ccc'
                            }}
                            disabled={isSubmitting}
                        />
                    ))}
                </div>
            </Form>
            <div className="text-center mt-3">
                {/* Add resend code logic if needed */}
                <Button type="button" mainClass="btn btn-link"
                        onClick={() => console.log("Resend code to", emailToVerify)}>
                    Resend Code
                </Button>
            </div>
        </Modal>
    );
}

export default VerifyEmailModal;