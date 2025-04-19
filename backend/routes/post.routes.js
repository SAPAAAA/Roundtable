import express from 'express';
import postController from '#controllers/post.controller.js';

const router = express.Router();

// Define more specific routes FIRST
router.get('/s/:subtableName/comments/:postId', postController.getPostDetails);

// Define the redirect route
router.get('/comments/:postId', postController.redirectToCanonicalPostUrl);

export default router;