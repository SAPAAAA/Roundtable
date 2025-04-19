import AuthService from '#services/auth.service.js';

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    // Use arrow function syntax
    register = async (req, res, next) => {
        try {
            console.log('Request body:', req.body);
            const {fullName, username, email, password} = req.body;
            const data = await this.authService.registerUser({fullName, username, email, password});
            if (data) {
                return res.status(201).json({
                    message: data.message,
                    success: data.success,
                    user: data.user,
                });
            }
        } catch (error) {
            // It's good practice to log the actual error
            console.error("Registration Error:", error);
            return res.status(error.statusCode).json({
                message: 'Internal server error',
                error: error.message,
                success: false,
            });
        }
    }

    // Use arrow function syntax
    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            console.log('[AuthController.login] Attempting login for username:', username);

            const data = await this.authService.login(username, password);

            console.log('[AuthController.login] User object received:', data);

            if (data) {
                console.log('[AuthController.login] Login successful for user ID:', data.user.userId); // Or another identifying field
                req.user = data.user; // Make the user data available to the next handler

                return next();

            } else {
                // Handle case where authService indicates invalid credentials (e.g., returns null/false)
                console.log('[AuthController.login] Invalid credentials provided for username:', username);
                return res.status(401).json({success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác'});
            }
        } catch (error) {
            console.error('[AuthController.login] Error during login process:', error);

            // Check if it's a specific authentication error thrown by the service
            if (error.statusCode === 401) {
                return res.status(401).json({
                    success: false,
                    message: error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // For other unexpected errors (DB errors, etc.), pass them to an Express error handler
            error.message = `Login process failed: ${error.message}`;
            return next(error); // Pass the error down the middleware chain
        }
    }

    finalizeLogin = async (req, res) => {
        console.log('[AuthController.finalizeLogin] Entered.');
        // This method now receives the req object potentially populated by AuthController.login
        console.log('[AuthController.finalizeLogin] req.user received:', JSON.stringify(req.user));
        console.log('[AuthController.finalizeLogin] req.session object BEFORE modification:', JSON.stringify(req.session));

        // Check if req.user was successfully populated by the preceding middleware
        if (req.user && req.user.userId) {
            console.log(`[AuthController.finalizeLogin] req.user is TRUTHY with userId: ${req.user.userId}. Attempting to set session.userId.`);
            try {
                req.session.userId = req.user.userId; // Set the session
                // It's good practice to save the session explicitly if needed, though often handled automatically
                // req.session.save(err => { if (err) { /* handle error */ } });
                console.log('[AuthController.finalizeLogin] req.session object AFTER modification:', JSON.stringify(req.session));

                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    user: req.user, // Send back user data (excluding sensitive info like passwords)
                });

            } catch (error) {
                console.error('[AuthController.finalizeLogin] Error during session modification:', error);
                return res.status(500).json({success: false, message: 'Internal server error during session update.'});
            }
        } else {
            // This case should ideally be caught by AuthController.login,
            // but it's a safeguard here. It might indicate an issue in AuthController.login not populating req.user correctly.
            console.warn('[AuthController.finalizeLogin] req.user is FALSY or missing userId. This might indicate an issue in the preceding login middleware.');
            console.log('[AuthController.finalizeLogin] Value of req.user:', req.user);
            return res.status(401).json({
                success: false,
                message: 'Login failed or user data incomplete after authentication.'
            });
        }
    }


    verifyEmail = async (req, res, next) => {
        try {
            const {email, code} = req.body;
            const result = await this.authService.verifyEmail(email, code);
            if (result) {
                return res.status(200).json({
                    ...result,
                });
            } else {
                return res.status(400).json({message: 'Mã xác thực không chính xác'});
            }
        } catch (error) {
            console.error("Email Verification Error:", error);
            return res.status(error.statusCode).json({
                message: 'Internal server error',
                error: error.message,
                success: false,
            });
        }
    }

    checkSession = async (req, res) => {
        try {
            // Check if the user is authenticated
            if (req.session && req.session.userId) {
                console.log('[AuthController.checkSession] User is authenticated:', req.session.userId);
                // Fetch user data based on session userId
                const result = await this.authService.loginWithSession(req.session.userId);
                if (result) {
                    console.log('[AuthController.checkSession] User data retrieved:', result);
                    return res.status(200).json({...result});
                } else {
                    console.log('[AuthController.checkSession] User not found for session ID:', req.session.userId);
                    return res.status(404).json({success: false, message: 'User not found'});
                }
            } else {
                console.log('[AuthController.checkSession] No active session found.');
                return res.status(401).json({success: false, message: 'No active session found'});
            }
        } catch (error) {
            console.error('[AuthController.checkSession] Error checking session:', error);
            return res.status(500).json({success: false, message: 'Internal server error'});
        }
    }

    logout = async (req, res) => {
        try {
            // Destroy the session
            req.session.destroy((err) => {
                if (err) {
                    console.error('[AuthController.logout] Error destroying session:', err);
                    return res.status(500).json({success: false, message: 'Internal server error'});
                }
                console.log('[AuthController.logout] Session destroyed successfully.');
                return res.status(200).json({success: true, message: 'Logout successful'});
            });
        } catch (error) {
            console.error('[AuthController.logout] Error during logout:', error);
            return res.status(500).json({success: false, message: 'Internal server error'});
        }
    }
}

export default new AuthController(AuthService);