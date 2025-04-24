// src/controllers/auth.controller.js

import authService from '#services/auth.service.js';
import HTTP_STATUS from '#constants/httpStatus.js';
// Import custom error types to handle them specifically
import {
    AuthenticationError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    VerificationError
} from '#errors/AppError.js'; // Adjust path as needed

/**
 * @class AuthController
 * @description Handles HTTP requests related to authentication, registration, etc.
 */
class AuthController {
    constructor(injectedAuthService) {
        // Use dependency injection for better testability
        this.authService = injectedAuthService;
    }

    /**
     * Handles user registration requests.
     * POST /register
     */
    register = async (req, res, next) => {
        try {
            const {fullName, username, email, password} = req.body;
            // Basic logging (avoid logging password)
            console.log('[AuthController.register] Attempting registration for username:', username);

            // Call the service layer - it returns data or throws specific errors
            const user = await this.authService.registerUser({fullName, username, email, password});

            // --- Success Response ---
            // Controller formats the successful response
            return res.status(HTTP_STATUS.CREATED).json({ // Use 201 Created status
                success: true,
                message: 'Registration successful. Please check your email for a verification code.',
                user: user, // Send back the user data returned by the service
            });

        } catch (error) {
            // --- Error Handling ---
            // Log the error message for debugging
            console.error("[AuthController.register] Registration Error:", error.message);

            // Map specific service errors to HTTP status codes and responses
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof ConflictError) {
                return res.status(HTTP_STATUS.CONFLICT).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                // Log the full stack for internal errors
                console.error(error.stack || error);
                // Send a generic message to the client
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Registration failed due to a server error. Please try again later.'
                });
            }

            // --- Fallback Error Handling ---
            // Catch any other unexpected errors (not instances of defined AppError subclasses)
            console.error("[AuthController.register] Unexpected Error:", error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred during registration.'
            });
        }
    }

    /**
     * Handles user login requests.
     * POST /login
     */
    login = async (req, res, next) => {
        try {
            const {username, password} = req.body;
            console.log('[AuthController.login] Attempting login for username:', username);

            // Call the service layer - returns user data or throws specific errors
            const user = await this.authService.login(username, password);

            // --- Session Handling (Controller's responsibility after successful auth) ---
            console.log('[AuthController.login] Authentication successful for userId:', user.userId);
            // Store identifier in session (make sure session middleware is configured)
            req.session.userId = user.userId;

            // Explicitly save the session to ensure it's written before responding
            // Note: Behavior might vary slightly based on session store implementation
            req.session.save((err) => {
                if (err) {
                    console.error('[AuthController.login] Critical: Error saving session after login:', err);
                    // If session cannot be saved, login effectively failed server-side
                    // Throw an InternalServerError to be caught below
                    throw new InternalServerError('Failed to establish user session after login.');
                }

                console.log('[AuthController.login] Session saved successfully for userId:', user.userId);

                // --- Success Response ---
                // Controller formats the successful response including user data
                return res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: 'Đăng nhập thành công.', // Login successful (Vietnamese)
                    user: user, // Send back the (safe) user data from the service
                });
            });

        } catch (error) {
            // --- Error Handling ---
            console.error('[AuthController.login] Error during login process:', error.message);

            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof AuthenticationError) {
                // 401 Unauthorized for bad credentials
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }
            if (error instanceof ForbiddenError) {
                // 403 Forbidden for issues like unverified, banned, suspended
                return res.status(HTTP_STATUS.FORBIDDEN).json({success: false, message: error.message});
            }
            if (error instanceof NotFoundError) {
                // This usually indicates data inconsistency found by the service
                console.error("[AuthController.login] Data Inconsistency Error:", error.message);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Login failed due to an internal account configuration issue. Please contact support."
                });
            }
            if (error instanceof InternalServerError) {
                console.error(error.stack || error);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error.message || 'Login failed due to a server error.'
                });
            }

            // --- Fallback Error Handling ---
            console.error("[AuthController.login] Unexpected Error:", error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred during login.'
            });
        }
    }

    /**
     * Handles email verification requests.
     * POST /verify-email
     */
    verifyEmail = async (req, res, next) => {
        try {
            const {email, code} = req.body;
            console.log('[AuthController.verifyEmail] Attempting verification for email:', email);

            // Call the service layer - returns true or throws specific errors
            await this.authService.verifyEmail(email, code);

            // --- Success Response ---
            // If the service call completes without error, verification was successful (or user already verified)
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Email verified successfully.', // Consistent success message
            });

        } catch (error) {
            // --- Error Handling ---
            console.error("[AuthController.verifyEmail] Email Verification Error:", error.message);

            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof VerificationError) {
                // Use 400 Bad Request for invalid/expired codes, as it's often due to user input/timing
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof NotFoundError) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                console.error(error.stack || error);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Verification failed due to a server error.'
                });
            }

            // --- Fallback Error Handling ---
            console.error("[AuthController.verifyEmail] Unexpected Error:", error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred during email verification.'
            });
        }
    }

    /**
     * Checks if a valid session exists and returns user data.
     * GET /session
     */
    checkSession = async (req, res) => {
        try {
            // --- Session Check (Controller Logic) ---
            if (req.session && req.session.userId) {
                const userId = req.session.userId;
                console.log('[AuthController.checkSession] Active session found for userId:', userId);

                // Call service to get user data based on session ID
                const user = await this.authService.loginWithSession(userId);

                // --- Success Response ---
                return res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: 'Session is valid.',
                    user: user, // Send back the user data
                });

            } else {
                // --- No Session Found ---
                console.log('[AuthController.checkSession] No active session identifier found.');
                // Use 401 Unauthorized to indicate client needs to authenticate
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'No active session found. Please log in.'
                });
            }
        } catch (error) {
            // --- Error Handling (from authService.loginWithSession) ---
            console.error('[AuthController.checkSession] Error during session check:', error.message);

            if (error instanceof NotFoundError) {
                // User ID from session is invalid/stale
                console.warn(`[AuthController.checkSession] User not found for stale session userId: ${req.session?.userId}`);
                // Treat as unauthorized because the session is invalid
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid session. Please log in again.'
                });
            }
            if (error instanceof ForbiddenError) { // If service checks status on session check
                console.warn(`[AuthController.checkSession] Forbidden access for session userId: ${req.session?.userId}, Reason: ${error.message}`);
                return res.status(HTTP_STATUS.FORBIDDEN).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) { // Should not happen if session ID check is done first
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                console.error(error.stack || error);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Session check failed due to a server error.'
                });
            }

            // --- Fallback Error Handling ---
            console.error("[AuthController.checkSession] Unexpected Error:", error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred during session check.'
            });
        }
    }

    /**
     * Handles user logout requests.
     * POST /logout
     */
    logout = async (req, res) => {
        // Session destruction is primarily a controller/framework concern
        if (req.session) {
            const userId = req.session.userId; // Log who is logging out for audit/debug purposes
            console.log(`[AuthController.logout] Attempting to destroy session for userId: ${userId || 'N/A'}`);

            req.session.destroy((err) => {
                if (err) {
                    // This is serious if session destruction fails
                    console.error(`[AuthController.logout] Error destroying session for userId ${userId || 'N/A'}:`, err);
                    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: 'Logout failed. Could not clear session.'
                    });
                }

                console.log(`[AuthController.logout] Session destroyed successfully for userId: ${userId || 'N/A'}.`);

                // --- Success Response ---
                // Also clear the session cookie on the client side
                // Ensure 'connect.sid' matches your session cookie name (it's the default for express-session)
                const sessionCookieName = req.app.get('trust proxy') ? (req.sessionOptions?.name || 'connect.sid') : (req.session.cookie?.name || 'connect.sid'); // More robust way to get cookie name
                res.clearCookie(sessionCookieName, {path: req.session.cookie?.path || '/'}); // Use path from cookie options if available

                return res.status(HTTP_STATUS.OK).json({success: true, message: 'Logout successful.'});
            });
        } else {
            // No session existed to destroy
            console.log('[AuthController.logout] No active session found to log out.');
            return res.status(HTTP_STATUS.OK).json({success: true, message: 'You are already logged out.'}); // Or simply OK status
        }
    }
}

// Export an instance, injecting the authService dependency
export default new AuthController(authService);