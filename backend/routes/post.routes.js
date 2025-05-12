import express from 'express';
import PostController from '#controllers/post.controller.js';
import CommentController from "#controllers/comment.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.get('/search', PostController.searchPosts);
router.get('/recent', PostController.getRecentPosts);
router.post('/by-ids', PostController.getPostsByIds);
router.get('/:postId', PostController.getPostDetails);
router.post('/:postId/comments', isAuthenticated, CommentController.addComment);
router.post('/:postId/vote', isAuthenticated, PostController.castVote);
router.post('/', isAuthenticated, PostController.createPost);
//router.put('/:postId', isAuthenticated, PostController.updatePost);
router.put('/:postId', isAuthenticated, (req, res) => {
    const body = req.body; // hoặc req.q.action
    if(body.body ===""){
        console.log("action xóa");
        return PostController.deletePost(req, res);
    }
    else {
        console.log("action sửa");
        return PostController.updatePost(req, res);
    }
    
});

export default router;