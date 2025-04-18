import React, {useState} from "react";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/posts/components/WriteComment/WriteComment";

import './Comment.css';
import Identifier from "#shared/components/UIElement/Identifier/Identifier.jsx";

// Added postId and potentially onReplyPosted callback prop
export default function Comment(props) {
    const {
        comment,
        postId, // Passed down from PostDetail
        onReplyPosted // Optional: Callback for PostDetail to know a reply was added
    } = props;

    const [isReplying, setIsReplying] = useState(false);

    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote(
        // Use comment.upvoteCount and comment.userVoteStatus if available, otherwise defaults
        {initialCount: comment.upvotes ?? 0, initialVoteStatus: comment.userVoteStatus ?? null},
        comment.id,
        'comment' // Specify type as comment for the hook if needed
    );

    const handleReplyClick = () => {
        setIsReplying(prev => !prev);
    };

    // Handler for when a reply is submitted via WriteComment
    const handlePostReply = async (replyData) => {
        console.log(`Submitting reply to comment ${comment.id}`, replyData);
        // --- TODO: API Call Logic ---

        // --- End TODO ---

        // For demo purposes, just closing the input:
        setIsReplying(false);
        if (onReplyPosted) {
            onReplyPosted(); // Notify parent even in demo mode if needed
        }
    };

    return (
        // Add a class for targeting replies if needed, e.g., based on parentId
        <div className={`comment-component card p-3 my-3 ${comment.parentId ? 'comment-reply' : ''}`}>
            {/* Comment Details */}
            <div className="d-flex align-items-center mb-2">
                <Avatar
                    src={comment.author.avatar.src}
                    alt={`r/${comment.author.username}`}
                    width={20}
                    height={20}/>
                <div className="d-flex flex-row flex-wrap fs-8">
                    <Identifier
                        addClass="ms-2"
                        type="subtable"
                        namespace={comment.author.username}/>
                    &nbsp;•&nbsp;
                    <span className="text-muted">{comment.time}</span>
                </div>
            </div>
            <div className="fs-content mt-2 mb-2">{comment.content}</div>

            {/* Actions - Styled like PostPreview containers, but with text */}
            <div className="d-flex align-items-center gap-2 mt-2">
                {voteError && <div className="text-danger fs-icon me-2">Error: {voteError}</div>}
                {/* Vote Container (Typically icon only) */}
                <div
                    className={`vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-light`}>
                    <Button
                        mainClass="upvote-btn"
                        contentType="icon" // Keep as icon for consistency if Button handles it
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Upvote"
                        tooltipPlacement="top"
                        padding="2"
                        onClick={handleUpvote}
                        disabled={isVoting}
                    >
                        <Icon mainClass="upvote-icon" name={voteStatus === "upvoted" ? "upvoted" : "upvote"}
                              size="15px"/>
                    </Button>
                    <span className="fs-icon">{voteCount ?? 0}</span>
                    <Button
                        mainClass="downvote-btn"
                        contentType="icon" // Keep as icon for consistency if Button handles it
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Downvote"
                        tooltipPlacement="top"
                        padding="2"
                        onClick={handleDownvote}
                        disabled={isVoting}
                    >
                        <Icon mainClass="downvote-icon" name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                              size="15px"/>
                    </Button>
                </div>

                {/* Reply Button Container - With Text */}
                <div className="reply-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <Button
                        mainClass="reply-btn"
                        // contentType might need adjustment if "icon" forces icon-only layout
                        // contentType="icon" // Keep or remove based on Button component behavior
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Reply to comment" // Adjusted tooltip
                        tooltipPlacement="top"
                        padding="2" // Adjust padding if needed with text
                        onClick={handleReplyClick} // onClick handler
                    >
                        <Icon
                            mainClass="comment-icon"
                            name="comment"
                            size="15px"
                        />
                        &nbsp;
                        <span className="ms-1 fs-icon">Reply</span>
                    </Button>
                </div>

                {/* Share Container - With Text */}
                <div className="share-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <Button
                        mainClass="share-btn"
                        // contentType="icon" // Keep or remove based on Button component behavior
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Share this comment" // Adjusted tooltip
                        tooltipPlacement="top"
                        padding="2" // Adjust padding if needed with text
                        onClick={() => console.log('Share comment clicked')} // Add actual share logic later
                    >
                        <Icon
                            mainClass="share-icon"
                            name="share"
                            size="15px"
                        />
                        &nbsp;
                        <span className="ms-1 fs-icon">Share</span>
                    </Button>
                </div>

                {/* Options Dropdown Container (Trigger remains icon-only) */}
                <div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <div className="dropdown">
                        <Button
                            mainClass="option-btn"
                            contentType="icon" // This trigger should remain icon-only
                            dataBsToggle="dropdown"
                            aria-expanded="false"
                            tooltipTitle="More options"
                            tooltipPlacement="top"
                            padding="2"
                        >
                            <Icon mainClass="option-icon" name="three_dots" size="15px"/>
                        </Button>
                        <ul className="dropdown-menu fs-icon">
                            <li><Button addClass="dropdown-item d-flex align-items-center"
                                        onClick={() => console.log('Save comment clicked')}> <Icon addClass="me-2"
                                                                                                   name="save"
                                                                                                   size="15px"/> Save
                            </Button></li>
                            <li><Button addClass="dropdown-item d-flex align-items-center"
                                        onClick={() => console.log('Report comment clicked')}> <Icon addClass="me-2"
                                                                                                     name="report"
                                                                                                     size="15px"/> Report
                            </Button></li>
                            {/* Add other options */}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Reply Input Area - Uses WriteComment */}
            {isReplying && (
                <div className="reply-input-area mt-3 ps-2">
                    <WriteComment
                        postId={postId}
                        username="CURRENT_USER_NAME"
                        src="CURRENT_USER_AVATAR_URL"
                        time="Just now"
                        parentId={comment.id}
                        onCommentSubmit={handlePostReply}
                        onCancel={() => setIsReplying(false)}
                        isReply={true}
                    />
                </div>
            )}

            {/* Recursive Rendering of Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies ps-4">
                    {comment.replies.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onReplyPosted={onReplyPosted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}