// src/middlewares/auth.mdw.js
import HTTP_STATUS from '#constants/httpStatus.js';

/**
 * Middleware to ensure the user is NOT authenticated.
 * If authenticated, redirects or sends an error.
 */
export const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        console.log('[Middleware/isNotAuthenticated] Denying access: User already logged in (userId:', req.session.userId, ')');
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'You are already logged in.',
        });
    }
    next();
};

/**
 * Middleware to ensure the user IS authenticated.
 * If not authenticated, redirects or sends an error.
 */
export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        console.log('[Middleware/isAuthenticated] Access granted for userId:', req.session.userId);
        return next();
    }
    // User is not authenticated
    console.log('[Middleware/isAuthenticated] Denying access: No active session found.');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required. Please log in.',
    });
};

