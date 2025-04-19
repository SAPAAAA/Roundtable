// #features/posts/components/PostPreview/PostPreview.jsx (or rename existing Post.jsx)
import React from "react";
import Link from "#shared/components/Navigation/Link/Link";

import PostHeaderPreview from "#features/posts/components/PostHeaderPreview/PostHeaderPreview";
import PostCore from "#features/posts/components/PostCore/PostCore";
import "./PostPreview.css";

export default function PostPreview(props) {
	const {post, isJoined, onJoinClick} = props;

	return (
		<Link to={`/s/${post.subtable.namespace}/comments/${post.postId}`} className="post-preview-link">
			<div className="post-preview-container card p-3 my-3">
				<PostHeaderPreview
					subtable={post.subtable}
					postTime={post.time}
					isJoined={isJoined} // Example prop
					onJoinClick={(e) => {
						e.preventDefault();
						onJoinClick?.(post.subtable.id);
					}} // Prevent navigation on join click
				/>
				<PostCore
					post={post}
					contentClass="post-content-preview"
				/>
			</div>
		</Link>
	);
}
