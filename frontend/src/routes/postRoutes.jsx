// #routes/postRoutes.js (or wherever postRoutes is defined)
import React, {lazy} from 'react';

import commentAction from "#features/posts/pages/PostDetailedView/commentAction.jsx";
import replyAction from "#features/posts/pages/PostDetailedView/replyAction.jsx";
import postDetailLoader from "#features/posts/pages/PostDetailedView/postDetailLoader.jsx";
import createPostLoader from "#features/posts/pages/CreatePost/createPostLoader.jsx";
import createPostAction from "#features/posts/pages/CreatePost/createPostAction.jsx";

const PostDetailView = lazy(() => import('#features/posts/pages/PostDetailedView/PostDetailedView'));
const CreatePost = lazy(() => import('#features/posts/pages/CreatePost/CreatePost'));

// --- Define the Routes ---
function postRoutes() {
    return [
        {
            path: "/comments/:postId", // Match the component path
            element: <PostDetailView/>,
            loader: postDetailLoader,
        },
        {
            path: "/submit",
            element: <CreatePost/>,
            loader: createPostLoader,
            action: createPostAction,
        },
        {
            path: "/comments/:commentId/replies", // Action for replies
            action: replyAction,
        },
        {
            path: "/posts/:postId/comment",      // Action for top-level comments
            action: commentAction,
        }
    ]
}

export default postRoutes;