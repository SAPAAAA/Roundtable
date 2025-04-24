import express from 'express';
import authController from '#controllers/auth.controller.js';
import {isNotAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', isNotAuthenticated, authController.login);
router.get('/session', authController.checkSession);
router.post('/logout', authController.logout);

export default router;