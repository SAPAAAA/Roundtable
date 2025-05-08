// features/posts/components/Comment/Comment.jsx (Refactored)
import React, {useCallback, useState} from "react";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/comments/components/WriteComment/WriteComment";

// Import the new composed components
import CommentHeader from '#features/comments/components/CommentHeader/CommentHeader';
import CommentBody from '#features/comments/components/CommentBody/CommentBody';
import CommentActions from '#features/comments/components/CommentActions/CommentActions';
import CommentReplies from '#features/comments/components/CommentReplies/CommentReplies';

import './Comment.css'; // cite: 103

export default function Comment(props) {
    const {
        comment,
        postId, // Receive postId from parent
        subtableName,
        onReplyPosted,
        currentUser // Receive current user from parent
    } = props;

    const [isReplying, setIsReplying] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false); // State for popover visibility

    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote({ // Correctly initialize useVote hook
        initialCount: comment.voteCount,
        initialVote: comment.userVote ?? null,
        postId: postId, // Pass postId to the hook
        commentId: comment.commentId,
    });

    // --- Action Handlers ---
    const handleReplyClick = useCallback(() => {
        setIsReplying(prev => !prev);
    }, []);

    const handlePostReply = useCallback(() => {
        setIsReplying(false);
        if (onReplyPosted) {
            onReplyPosted(); // Call parent handler to refetch/revalidate
        }
    }, [onReplyPosted]);

    const handleSaveComment = useCallback(() => {
        console.log(`Save comment clicked: ${comment.commentId}`);
        // Add actual save logic here
    }, [comment.commentId]);

    const handleReportComment = useCallback(() => {
        console.log(`Report comment clicked: ${comment.commentId}`);
        // Add actual report logic here
    }, [comment.commentId]);

    const handlePopoverOpen = useCallback(() => {
        setIsPopoverOpen(true);
    }, []);

    const handlePopoverClose = useCallback(() => {
        setIsPopoverOpen(false);
    }, []);

    const isReply = !!comment.parentCommentId;

    // Conditional class for z-index fix when popover is open
    const commentComponentClasses = `
        comment-component card p-3 my-2
        ${isReply ? 'comment-reply' : ''}
        ${isPopoverOpen ? 'popover-is-open' : ''}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div
            className={`comment-thread-item ${isReply ? 'is-reply-item' : ''}`}
            id={`comment-${comment.commentId}`}
        >
            {/* --- Composition in Action --- */}
            <div className={commentComponentClasses}>
                <CommentHeader
                    author={comment.author}
                    createdAt={comment.commentCreatedAt}
                />
                <CommentBody body={comment.body}/>
                <CommentActions
                    voteStatus={voteStatus}
                    voteCount={voteCount}
                    isVoting={isVoting}
                    voteError={voteError}
                    handleUpvote={handleUpvote}
                    handleDownvote={handleDownvote}
                    handleReplyClick={handleReplyClick}
                    handleSaveComment={handleSaveComment}
                    handleReportComment={handleReportComment}
                    onPopoverOpen={handlePopoverOpen}
                    onPopoverClose={handlePopoverClose}
                />

                {/* Reply Input Area */}
                {isReplying && (
                    <div className="reply-input-area mt-3">
                        <WriteComment
                            postId={postId} // Pass postId
                            parentCommentId={comment.commentId}
                            onCommentSubmit={handlePostReply}
                            onCancel={() => setIsReplying(false)}
                            // subtableName might not be needed directly by WriteComment
                        />
                    </div>
                )}
            </div>

            {/* Replies - Rendered by its own component */}
            <CommentReplies
                replies={comment.replies}
                postId={postId} // Pass necessary props down
                subtableName={subtableName}
                onReplyPosted={onReplyPosted}
                currentUser={currentUser}
            />
            {/* --- End Composition --- */}
        </div>
    );
}