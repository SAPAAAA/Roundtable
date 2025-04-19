// #features/posts/components/PostCore/PostCore.jsx
import React from "react";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import "./PostCore.css"; // Add specific styling if needed

export default function PostCore(props) {
    const {post} = props;

    // Encapsulate vote logic here
    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote({initialCount: post.upvotes, initialVoteStatus: null}, post.id);

    // --- Share Handler --- (Could be passed as prop if complex)
    const handleShare = () => {
        console.log("Share action triggered for post:", post.id);
        // Implement actual share logic (e.g., copy link, open share modal)
        navigator.clipboard.writeText(window.location.href + `posts/${post.id}`) // Example
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error("Failed to copy link: ", err));
    };

    // --- Comment Handler Placeholder ---
    // In the preview, this might navigate. In detailed view, it might focus the input.
    // Or often, clicking anywhere on the post preview navigates.
    // Let's assume clicking the comment button itself doesn't do much in the core view,
    // navigation is handled by clicking the post container in the preview.
    const handleCommentClick = () => {
        console.log("Comment button clicked - navigation/focus handled by parent view");
    };

    return (
        <>
            {/* PostPreview Title */}
            <h5 className="fw-bold mt-2">{post.title}</h5>

            {/* PostPreview Content */}
            {/* Add a class for potential truncation/styling in preview vs detailed */}
            <div className={`fs-content mt-2 mb-2 ${props.contentClass || ''}`}>{post.content}</div>

            {/* PostPreview Actions */}
            <div className="post-actions-container d-flex align-items-center gap-2">
                {voteError && <div className="text-danger fs-8 me-2">Error: {voteError}</div>}

                {/* Vote Buttons */}
                <div
                    className={`vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-light p-1`}> {/* Added padding */}
                    <Button
                        mainClass="upvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Upvote" tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={handleUpvote} disabled={isVoting}>
                        <Icon mainClass="upvote-icon" name={voteStatus === "upvoted" ? "upvoted" : "upvote"}
                              size="15px"/>
                    </Button>
                    {/* Ensure voteCount displays correctly */}
                    <span className="fs-8 fw-bold">{voteCount ?? 0}</span>
                    <Button
                        mainClass="downvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Downvote"
                        tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={handleDownvote} disabled={isVoting}>
                        <Icon mainClass="downvote-icon" name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                              size="15px"/>
                    </Button>
                </div>

                {/* Comment Button */}
                <div
                    className="comment-container d-flex align-items-center rounded-pill gap-1 bg-light p-1"> {/* Added padding, adjusted gap */}
                    <Button
                        mainClass="comment-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Comments"
                        tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={handleCommentClick} // Use the handler
                    >
                        <Icon mainClass="comment-icon" name="comment" size="15px"/>
                        <span className="fs-8 fw-bold">{post.commentCount ?? 0}</span>

                    </Button>
                    {/* Display comment count next to icon */}
                </div>

                {/* Share Button */}
                <div
                    className="share-container d-flex align-items-center rounded-pill gap-1 bg-light p-1"> {/* Added padding, adjusted gap */}
                    <Button
                        mainClass="share-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Share" tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={handleShare}>
                        <Icon mainClass="share-icon" name="share" size="15px"/>
                        <span className="fs-8 fw-bold">Share</span>
                    </Button>
                </div>
            </div>
        </>
    );
}