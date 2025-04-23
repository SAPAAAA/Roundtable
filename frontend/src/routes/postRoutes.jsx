import React, {lazy} from 'react';
import commentAction from "#features/posts/components/WriteComment/commentAction.jsx";

const PostDetailView = lazy(() => import('#features/posts/pages/PostDetailedView/PostDetailedView'));

function postRoutes() {
    return [
        {
            path: "s/:subtableName/comments/:postId",
            element: <PostDetailView/>,
            action: commentAction,
        }
    ]
}

export default postRoutes;