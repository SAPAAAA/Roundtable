import express from 'express';
import AuthController from '#controllers/auth.controller.js';
import {isNotAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/login', isNotAuthenticated, AuthController.login);
router.get('/session', AuthController.checkSession);
router.post('/logout', AuthController.logout);
router.put('/profile', AuthController.updateProfile);

export default router;