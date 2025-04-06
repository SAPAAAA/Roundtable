// src/context/AuthContext.js (or choose a suitable path like /features/auth/context/)

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';

// --- Mock API Calls ---
const MOCK_API_DELAY = 500; // ms

const mockLoginApi = async (username, password) => {
    console.log(`Attempting login for: ${username}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY)); // Simulate network delay
    if (username === 'testingtesting' && password === 'test') {
        // Simulate successful login
        const user = {
            username: 'testingtesting',
            email: 'test@example.com',
            avatar: 'https://via.placeholder.com/150/000000/FFFFFF/?text=Test' // Default test user avatar
        };
        const token = 'fake-jwt-token'; // Simulate receiving a token
        return {success: true, user, token};
    } else {
        // Simulate failed login
        return {success: false, message: 'Invalid username or password'};
    }
};

const mockRegisterApi = async (userData) => {
    console.log('Attempting registration for:', userData);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY)); // Simulate network delay
    // Simulate success - in reality, check for existing email etc.
    if (userData.email && userData.password && userData.username) {
        const user = {
            username: userData.username,
            email: userData.email,
            avatar: 'https://via.placeholder.com/150/000000/FFFFFF/?text=Test' // Default test user avatar
        };
        const token = 'new-fake-jwt-token';
        return {success: true, user, token};
    } else {
        return {success: false, message: 'Missing registration details'};
    }
};

const mockLogoutApi = async () => {
    console.log('Logging out');
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2));
    // Logout on backend rarely fails unless token was already invalid
    return {success: true};
};
// --- End Mock API Calls ---


// 1. Create the Context
const AuthContext = createContext({
    user: null,             // Current user object or null
    token: null,            // Authentication token
    isLoading: true,        // Loading state for auth operations / initial check
    error: null,            // Store any auth-related errors
    login: async (username, password) => {
    }, // Placeholder function
    logout: () => {
    },       // Placeholder function
    register: async (userData) => {
    }, // Placeholder function
});


// 2. Create the Provider Component
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null); // Check local storage initially
    const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done
    const [error, setError] = useState(null);

    // Check authentication status on initial load
    useEffect(() => {
        const checkAuth = () => {
            setIsLoading(true);
            setError(null);
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');

            if (storedToken && storedUser) {
                console.log("Found existing auth details in localStorage");
                setToken(storedToken);
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    // Clear invalid stored data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    setToken(null);
                    setUser(null);
                }
            } else {
                console.log("No existing auth details found.");
            }
            setIsLoading(false); // Finished initial check
        };
        checkAuth();
    }, []); // Empty dependency array ensures this runs only once on mount


    // Login function
    const login = useCallback(async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await mockLoginApi(username, password);
            if (response.success) {
                setUser(response.user);
                setToken(response.token);
                localStorage.setItem('authToken', response.token); // Persist token
                localStorage.setItem('authUser', JSON.stringify(response.user)); // Persist user info
                console.log('Login successful:', response.user);
                return true; // Indicate success
            } else {
                setError(response.message || 'Login failed');
                setUser(null);
                setToken(null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                console.error('Login failed:', response.message);
                return false; // Indicate failure
            }
        } catch (err) {
            console.error("Login API error:", err);
            setError('An unexpected error occurred during login.');
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            return false; // Indicate failure
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback to memoize the function

    // Register function
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await mockRegisterApi(userData);
            if (response.success) {
                // Option 1: Automatically log in the user after registration
                setUser(response.user);
                setToken(response.token);
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('authUser', JSON.stringify(response.user));
                console.log('Registration successful & logged in:', response.user);
                return {success: true, user: response.user};

                // Option 2: Just register, require separate login
                // console.log('Registration successful');
                // return { success: true };

            } else {
                setError(response.message || 'Registration failed');
                console.error('Registration failed:', response.message);
                return {success: false, message: response.message};
            }
        } catch (err) {
            console.error("Register API error:", err);
            setError('An unexpected error occurred during registration.');
            return {success: false, message: 'An unexpected error occurred.'};
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback

    // Logout function
    const logout = useCallback(async () => {
        setIsLoading(true); // Optional: show loading during logout API call
        setError(null);
        console.log('Initiating logout...');
        try {
            await mockLogoutApi(); // Call backend logout if necessary
        } catch (err) {
            console.error("Logout API error:", err);
            // Decide if you want to block frontend logout if API fails
            // setError('Logout failed on server, but logging out locally.');
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            console.log('Logged out locally.');
            setIsLoading(false); // Ensure loading is set to false
        }

    }, []); // useCallback


    // Value provided to consuming components
    const contextValue = {
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};


// 3. Create the custom hook for easy consumption
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) { // Or check if context is the initial placeholder object
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};