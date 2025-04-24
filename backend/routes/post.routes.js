import express from 'express';
import postController from '#controllers/post.controller.js';
import commentController from "#controllers/comment.controller.js";

const router = express.Router();

router.get('/:postId', postController.getPostDetails);

router.post('/:postId/comments', commentController.addComment);

export default router;