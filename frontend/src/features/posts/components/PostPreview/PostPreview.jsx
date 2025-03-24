import React from "react";

export default function PostPreview(props) {
    return (
        <div className="card p-3 my-3">
            {/* Subreddit Info */}
            <div className="d-flex align-items-center mb-2">
                <span className="text-muted">{props.post.subreddit} • {props.post.time}</span>
            </div>

            {/* Post Title */}
            <h5 className="fw-bold">{props.post.title}</h5>

            {/* Post Content */}
            <p>{props.post.content}</p>

            {/* Post Actions */}
            <div className="d-flex align-items-center">
                <button className="btn btn-outline-light me-2">
                    <i className="bi bi-arrow-up"></i> {props.post.upvotes}
                </button>
                <button className="btn btn-outline-light me-2">
                    <i className="bi bi-arrow-down"></i>
                </button>
                <button className="btn btn-outline-light me-2">
                    <i className="bi bi-chat-left"></i> {props.post.comments}
                </button>
                <button className="btn btn-outline-light">
                    <i className="bi bi-share"></i> Share
                </button>
            </div>
        </div>
    );
}
