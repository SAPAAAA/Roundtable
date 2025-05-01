import express from 'express';
import CommentController from "#controllers/comment.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/:commentId/replies', isAuthenticated, CommentController.replyToComment);
router.post('/:commentId/vote', isAuthenticated, CommentController.castVote);

export default router;