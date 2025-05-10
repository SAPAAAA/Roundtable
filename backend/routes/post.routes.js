import express from 'express';
import PostController from '#controllers/post.controller.js';
import CommentController from "#controllers/comment.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.get('/:postId', PostController.getPostDetails);
router.post('/:postId/comments', isAuthenticated, CommentController.addComment);
router.post('/:postId/vote', isAuthenticated, PostController.castVote);
router.post('/', isAuthenticated, PostController.createPost);
router.put('/:postId', isAuthenticated, PostController.updatePost);

export default router;