import express from 'express';
import postController from '#controllers/post.controller.js';
import commentController from "#controllers/comment.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.get('/:postId', postController.getPostDetails);
router.post('/:postId/comments', isAuthenticated, commentController.addComment);
router.post('/:postId/vote', isAuthenticated, postController.castVote);

export default router;