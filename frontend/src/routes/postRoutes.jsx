// #routes/postRoutes.js (or wherever postRoutes is defined)
import React, {lazy} from 'react';

import commentAction from "#features/posts/pages/PostDetailedView/commentAction.jsx";
import replyAction from "#features/posts/pages/PostDetailedView/replyAction.jsx";
import postDetailLoader from "#features/posts/pages/PostDetailedView/postDetailLoader.jsx";

const PostDetailView = lazy(() => import('#features/posts/pages/PostDetailedView/PostDetailedView'));

// --- Define the Routes ---
function postRoutes() {
    return [
        {
            path: "/comments/:postId", // Match the component path
            element: <PostDetailView/>,
            loader: postDetailLoader,
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