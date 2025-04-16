import React, {createContext, useCallback, useEffect, useState} from 'react';
// Assuming your sendApiRequest utility is correctly set up for credentials
import sendApiRequest from '#hooks/apiClient'; // Adjust path if needed

// Context
const AuthContext = createContext({
    user: null,             // Current user object or null
    isLoading: true,        // Start loading until initial check done
    error: null,            // Store any auth-related errors (session check/logout)
    logout: async () => {
    },       // Logout function
    checkSession: async () => {
    }, // Function to re-check session status
});

// Provider Component
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // For async checks
    const [error, setError] = useState(null);

    // Function to check backend session status
    const checkSession = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setIsLoading(true);
        }
        // Clear previous errors before checking
        // setError(null); // Optional: Decide if checkSession should clear errors
        console.log("Checking backend session...");
        try {
            // Assumes GET /api/auth/session returns { success: true, user: {...} } if logged in
            const response = await sendApiRequest('http://localhost:5000/api/auth/session', {
                method: 'GET'
            });

            console.log("Session check response:", response);

            if (response && response.user) {
                setUser(response.user);
                setError(null); // Clear error on successful fetch
                console.log("Session valid, user loaded/updated:", response.user);
            } else {
                setUser(null);
                console.log("Session endpoint returned success but no user data.");
            }
        } catch (err) {
            // Expect a 401 Unauthorized error if not logged in
            if (err.status === 401) {
                console.log("No active session found.");
                setError(null); // Not an error, just not logged in
            } else {
                console.error("Error checking session:", err);
                setError("Could not verify login status."); // Network or server error
            }
            setUser(null); // Ensure user is null if check fails for any reason other than success
        } finally {
            if (showLoading) {
                setIsLoading(false); // Finished check
            }
        }
    }, []); // useCallback depends on nothing external to this definition

    // Check authentication status on initial load
    useEffect(() => {
        checkSession(); // Call the checkSession function on mount
    }, [checkSession]); // Depend on the memoized checkSession function


    // Logout function
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log('Initiating logout...');
        try {
            await sendApiRequest('http://localhost:5000/api/auth/logout', {
                method: 'POST'
            });
            console.log('Backend logout successful.');
        } catch (err) {
            console.error("Logout API error:", err);
            // setError('Logout failed on server, proceeding locally.'); // Optional: Inform user
        } finally {
            // Clear local state regardless of API call success
            setUser(null);
            console.log('Logged out locally.');
            setIsLoading(false);
        }
    }, []); // useCallback

    // Value provided to consuming components
    const contextValue = {
        user,
        isLoading,
        error,
        logout,
        checkSession // Provide the function to manually re-check
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
export {AuthContext};