// src/hooks/useLoginForm.js
import {useEffect, useState} from 'react';

const useLoginForm = (isOpen, authError) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    return {
        email,
        setEmail,
        password,
        setPassword,
        error
    };
};

export default useLoginForm;