import React from "react";

import PostPreview from "@features/posts/components/PostPreview/PostPreview";

export default function ListPostPreview(props) {
    return (
        <div className="list-post-preview">
            {props.posts.map((post, index) => (
                <PostPreview key={index} post={post} />
            ))}
        </div>
    );
}