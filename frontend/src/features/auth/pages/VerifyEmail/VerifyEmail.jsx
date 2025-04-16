import React, {useEffect, useState} from 'react';
import './VerifyEmail.css';
import Input from '@shared/components/UIElement/Input/Input';
import Button from '@shared/components/UIElement/Button/Button';
import Form from '@shared/components/UIElement/Form/Form';
import {useActionData, useLocation, useNavigate, useNavigation} from "react-router";

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const actionData = useActionData();
    const navigation = useNavigation();

    // Prefill email from navigation state if available
    const [email, setEmail] = useState(location.state?.prefilledEmail || '');
    // State for the 6 individual digit inputs
    const [code, setCode] = useState(Array(6).fill(''));

    // --- Handle individual digit input ---
    const handleChange = (e, index) => {
        const {value} = e.target;
        // Allow only single digits
        if (/^\d?$/.test(value)) { // Allow empty string for backspace/delete
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Auto-focus next input if a digit was entered
            if (value && index < 5) {
                document.getElementById(`code-${index + 1}`)?.focus();
            }
        }
    };

    // --- Handle backspace/delete ---
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            // If current input is empty and backspace is pressed, focus previous input
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    }

    // Combine the code array into a single string for submission
    const combinedCode = code.join('');

    useEffect(() => {
        // Redirect to login page if verification is successful
        if (actionData && actionData.success) {
            navigate('/login', {replace: true});
        }
        if (actionData && actionData.error) {
            // Handle error (e.g., show a message)
            console.error(actionData.error);
        }
    }, [actionData, navigate]);

    return (
        <div className="verify-email-container d-flex flex-column align-items-center justify-content-center min-vh-100 position-relative overflow-hidden">
            {/* Background shapes */}
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
                    <h1 className="card-title mb-3">Check your inbox!</h1>
                    <p className="card-text mb-4">
                        Please enter the 6-digit verification code sent to <strong>{email || 'your email'}</strong>.
                    </p>
                    {/* Use React Router's Form component for automatic submission to action */}
                    <Form
                        id="verify-email-form"
                        method="post" // Method should be POST
                        action="/verify-email" // Action route defined in authRoutes
                        className="d-flex flex-column align-items-center"
                    >
                        {/* Hidden input for the email (prefilled) */}
                        <Input
                            id="email"
                            name="email" // Name attribute is crucial for formData
                            type="hidden"
                            value={email} // Value comes from state
                        />

                        {/* === Hidden input for the combined verification code === */}
                        <Input
                            id="verification-code"
                            name="code" // Name your backend API expects for the code
                            type="hidden"
                            value={combinedCode} // Value is the joined code string
                        />
                        {/* ====================================================== */}

                        {/* Visible inputs for individual digits */}
                        <div className="d-flex justify-content-center gap-2 mb-4"> {/* Reduced gap */}
                            {code.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`code-${index}`}
                                    // No 'name' needed for these individual inputs if using the hidden field approach
                                    type="tel" // Use "tel" for numeric keyboard on mobile
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)} // Handle backspace
                                    mainClass="form-control text-center"
                                    inputMode="numeric" // Hint for numeric input
                                    pattern="[0-9]*"    // Pattern for validation (optional)
                                    autoComplete="one-time-code" // Helps password managers
                                    style={{
                                        width: '45px',
                                        height: '50px',
                                        fontSize: '1.2rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ccc'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Add resend code logic/button here if needed */}

                        <div className="d-flex justify-content-center">
                            <Button
                                type="submit"
                                mainClass="btn btn-primary btn-lg"
                                style={{borderRadius: '8px', padding: '10px 30px'}}
                                // Disable button if code is not fully entered
                                disabled={combinedCode.length !== 6 || navigation.state === 'submitting'}
                            >
                                {navigation.state === 'submitting' ? 'Verifying...' : 'Verify Code'}
                            </Button>
                        </div>
                    </Form>
                    {/* Add link back to login or other relevant actions */}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;