import express from 'express';
import authController from '#controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login, (req, res) => {
    // Add session userId if login is successful
    if (req.user) {
        req.session.userId = req.user.userId;
        return res.status(200).json({
            message: 'Login successful',
            user: req.user,
        });
    } else {
        return res.status(401).json({message: 'Invalid credentials'});
    }
});

export default router;