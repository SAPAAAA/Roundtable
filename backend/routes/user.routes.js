import express from 'express';
import UserController from '#controllers/user.controller.js';

const router = express.Router();

router.get('/search', UserController.searchUsers);
router.get('/:userId', UserController.getUserProfile);
router.get('/:userId/:mediaId', UserController.getUserMedia);

export default router; 