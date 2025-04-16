import express from 'express';
import authController from '#controllers/auth.controller.js';
import AuthController from '#controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
// In auth.routes.js
router.post('/login', authController.login, (req, res) => {
    console.log('[Login Route Handler] Entered.');
    // Check if req.user is populated by authController.login middleware
    console.log('[Login Route Handler] req.user received:', JSON.stringify(req.user)); // Log the user object
    console.log('[Login Route Handler] req.session object BEFORE modification:', JSON.stringify(req.session));

    if (req.user && req.user.userId) { // Also check if userId exists on the user object
        console.log(`[Login Route Handler] req.user is TRUTHY with userId: ${req.user.userId}. Attempting to set session.userId.`);
        try {
            req.session.userId = req.user.userId;
            console.log('[Login Route Handler] req.session object AFTER modification:', JSON.stringify(req.session)); // Verify userId is set in the object

            return res.status(200).json({
                success: true, // Explicitly add success flag if your frontend expects it
                message: 'Login successful',
                user: req.user,
            });

        } catch (error) {
            console.error('[Login Route Handler] Error during session modification:', error);
            return res.status(500).json({success: false, message: 'Internal server error during session update.'});
        }
    } else {
        console.warn('[Login Route Handler] req.user is FALSY or missing userId. Sending 401.');
        console.log('[Login Route Handler] Value of req.user:', req.user); // Log the actual value if it failed the check
        return res.status(401).json({success: false, message: 'Invalid credentials or user data incomplete.'});
    }
});

router.get('/session', AuthController.checkSession);
router.post('/logout', AuthController.logout);

export default router;