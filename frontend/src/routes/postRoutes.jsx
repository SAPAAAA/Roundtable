import React, {lazy} from 'react';
import commentAction from "#features/posts/pages/PostDetailedView/commentAction.jsx";

const PostDetailView = lazy(() => import('#features/posts/pages/PostDetailedView/PostDetailedView'));

function postRoutes() {
    return [
        {
            path: "/comments/:postId",
            element: <PostDetailView/>,
            action: commentAction,
        }
    ]
}

export default postRoutes;