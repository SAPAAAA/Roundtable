// #features/posts/components/PostCore/PostCore.jsx
import React from "react";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import "./PostCore.css"; // Add specific styling if needed

export default function PostCore(props) {
    // Destructure post from props. userVote is now directly on the post object from the service.
    const {post} = props;

    // Initialize the hook with data from the post object
    const {
        voteStatus, // Will be 'upvote', 'downvote', or null
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote(
        {
            initialCount: post.voteCount,
            initialVote: post.userVote,
            postId: post.postId,
        },
    );

    // --- Share Handler ---
    const handleShare = () => {
        const postUrl = `${window.location.origin}/posts/${post.postId}`; // Construct a more robust URL
        navigator.clipboard.writeText(postUrl)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error("Failed to copy link: ", err));
    };

    // --- Comment Handler Placeholder ---
    const handleCommentClick = () => {
        // Find the comment section and scroll to it, or trigger a state change in parent
        const commentSection = document.getElementById('comment-section'); // Example ID
        if (commentSection) {
            commentSection.scrollIntoView({behavior: 'smooth'});
        }
    };

    console.log("PostCore post: ", post);

    return (
        <>
            {/* Post Title */}
            <h5 className="fw-bold mt-2">{post.title}</h5>

            {/* Post Content */}
            {post.body && ( // Only render body if it exists
                <div className={`fs-content mt-2 mb-2 ${props.contentClass || ''}`}>{post.body}</div>
            )}


            {/* Post Actions */}
            <div className="post-actions-container d-flex align-items-center gap-2 mt-2">
                {voteError && <div className="text-danger fs-8 me-2">Error: {voteError}</div>}

                {/* Vote Buttons */}
                {/* Use voteStatus ('upvote'/'downvote'/null) for dynamic class */}
                <div
                    className={`vote-container ${voteStatus || 'no-vote'} d-flex align-items-center rounded-pill gap-2 bg-light p-1`}>
                    <Button
                        mainClass="upvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Upvote" tooltipPlacement="top"
                        padding="1"
                        onClick={handleUpvote} disabled={isVoting}>
                        {/* Use voteStatus to determine icon state */}
                        <Icon mainClass="upvote-icon" name="upvote"
                              size="15px"/>
                    </Button>
                    <span
                        className="fs-8 fw-bold vote-count">{voteCount}</span> {/* Added class for potential styling */}
                    <Button
                        mainClass="downvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Downvote"
                        tooltipPlacement="top"
                        padding="1"
                        onClick={handleDownvote} disabled={isVoting}>
                        {/* Use voteStatus to determine icon state */}
                        <Icon mainClass="downvote-icon" name='downvote'
                              size="15px"/>
                    </Button>
                </div>

                {/* Comment Button */}
                <div
                    className="comment-container d-flex align-items-center rounded-pill gap-1 bg-light p-1">
                    {/* Make the whole div clickable or just the button */}
                    <Button
                        mainClass="comment-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Comments"
                        tooltipPlacement="top"
                        padding="1"
                        onClick={handleCommentClick}
                    >
                        <Icon mainClass="comment-icon" name="comment" size="15px"/>
                        {/* Ensure commentCount exists before displaying */}
                        <span className="fs-8 fw-bold ms-1">{post.commentCount ?? 0}</span>
                    </Button>
                </div>

                {/* Share Button */}
                <div
                    className="share-container d-flex align-items-center rounded-pill gap-1 bg-light p-1">
                    <Button
                        mainClass="share-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Share" tooltipPlacement="top"
                        padding="1"
                        onClick={handleShare}>
                        <Icon mainClass="share-icon" name="share" size="15px"/>
                        <span className="fs-8 fw-bold ms-1">Share</span> {/* Added margin */}
                    </Button>
                </div>
            </div>
        </>
    );
}
