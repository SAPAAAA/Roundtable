import express from 'express';
import commentController from "#controllers/comment.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/:commentId/replies', isAuthenticated, commentController.replyToComment);
router.post('/:commentId/vote', isAuthenticated, commentController.castVote);

export default router;