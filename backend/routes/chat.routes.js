import express from 'express';
import ChatController from "#controllers/chat.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.get('/partners', isAuthenticated, ChatController.getConversationPartnersPreview);
router.get('/:partnerUserId/messages', isAuthenticated, ChatController.getMessages);
router.post('/messages', isAuthenticated, ChatController.sendMessage);
router.post('/:partnerUserId/messages/read', isAuthenticated, ChatController.readMessages);

export default router;