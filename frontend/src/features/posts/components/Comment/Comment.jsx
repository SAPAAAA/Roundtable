// posts/components/Comment/Comment.jsx
import React, {useState} from "react";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/posts/components/WriteComment/WriteComment";
import PopoverMenu from "#shared/components/UIElement/PopoverMenu/PopoverMenu"; // *** IMPORT PopoverMenu ***
import Identifier from "#shared/components/UIElement/Identifier/Identifier.jsx";

import './Comment.css';

export default function Comment(props) {
    const {
        comment,
        postId,
        onReplyPosted
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
        {initialCount: comment.upvotes ?? 0, initialVoteStatus: comment.userVoteStatus ?? null},
        comment.id,
        'comment'
    );

    const handleReplyClick = () => {
        setIsReplying(prev => !prev);
    };

    const handlePostReply = async (replyData) => {
        console.log(`Submitting reply to comment ${comment.id}`, replyData);
        // API Call Logic...
        setIsReplying(false);
        if (onReplyPosted) {
            onReplyPosted();
        }
    };

    // --- Handlers for Comment Options ---
    const handleSaveComment = () => {
        console.log(`Save comment clicked: ${comment.id}`);
        // Implement actual save logic
    };

    const handleReportComment = () => {
        console.log(`Report comment clicked: ${comment.id}`);
        // Implement actual report logic
    };
    // --- End Handlers ---


    return (
        <div className={`comment-component card p-3 my-3 ${comment.parentId ? 'comment-reply' : ''}`}>
            {/* Comment Details */}
            <div className="d-flex align-items-center mb-2">
                <Avatar
                    src="https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80" // Placeholder for comment author avatar
                    alt="Comment Author Avatar"
                    width={20}
                    height={20}/>
                <div className="d-flex flex-row flex-wrap fs-8">
                    {/* Assuming Identifier can handle user type */}
                    <Identifier
                        addClass="ms-2 fw-bold" // Make username bold
                        type="user" // Set type to user
                        namespace="someone"/>
                    &nbsp;•&nbsp;
                    <span className="text-muted">{Date.now() - comment.createdAt}</span>
                </div>
            </div>
            <div className="fs-content mt-2 mb-2">{comment.content}</div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2 mt-2">
                {voteError && <div className="text-danger fs-icon me-2">Error: {voteError}</div>}
                {/* Vote Container */}
                <div
                    className={`vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-light p-1`}> {/* Consistent padding */}
                    <Button
                        mainClass="upvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Upvote" tooltipPlacement="top"
                        padding="1" onClick={handleUpvote} disabled={isVoting}>
                        <Icon mainClass="upvote-icon" name={voteStatus === "upvoted" ? "upvoted" : "upvote"}
                              size="15px"/>
                    </Button>
                    <span className="fs-icon">{voteCount ?? 0}</span>
                    <Button
                        mainClass="downvote-btn" contentType="icon"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Downvote"
                        tooltipPlacement="top"
                        padding="1" onClick={handleDownvote} disabled={isVoting}>
                        <Icon mainClass="downvote-icon" name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                              size="15px"/>
                    </Button>
                </div>

                {/* Reply Button Container */}
                <div
                    className="reply-container d-flex align-items-center rounded-pill gap-1 bg-light p-1"> {/* Consistent padding/gap */}
                    <Button
                        mainClass="reply-btn"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Reply" tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={handleReplyClick}
                    >
                        <Icon mainClass="comment-icon" name="comment" size="15px"/>
                        <span className="ms-1 fs-icon">Reply</span> {/* Ensure fs-icon matches vote count style */}
                    </Button>
                </div>

                {/* Share Container */}
                <div
                    className="share-container d-flex align-items-center rounded-pill gap-1 bg-light p-1"> {/* Consistent padding/gap */}
                    <Button
                        mainClass="share-btn"
                        dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Share" tooltipPlacement="top"
                        padding="1" // Adjusted padding
                        onClick={() => console.log('Share comment clicked')}
                    >
                        <Icon mainClass="share-icon" name="share" size="15px"/>
                        <span className="ms-1 fs-icon">Share</span> {/* Ensure fs-icon matches vote count style */}
                    </Button>
                </div>

                {/* *** Options using PopoverMenu *** */}
                <div className="option-container d-flex align-items-center"> {/* Removed bg-light/pill here */}
                    <PopoverMenu
                        mainClass="option-menu" // Class for the popover content
                        addClass="bg-white rounded shadow-sm border" // Style popover like PostOptions
                        position="bottom-end" // Position relative to trigger
                        trigger={ // The button that opens the menu
                            <Button
                                mainClass="option-btn"
                                contentType="icon"
                                padding="2" // Padding for the trigger button
                                roundedPill // Make trigger button pill shape
                                addClass="bg-light" // Keep trigger bg light
                                dataBsToggle="tooltip" // Keep tooltip if desired
                                dataBsTrigger="hover focus"
                                tooltipTitle="More options"
                                tooltipPlacement="top"
                                ariaLabel="Comment Options"
                                // REMOVED data-bs-toggle="dropdown"
                            >
                                <Icon mainClass="option-icon" name="three_dots" size="15px"/>
                            </Button>
                        }
                    >
                        {/* Content of the popover menu */}
                        <Button mainClass="save-btn w-100" type="button" justifyContent="start" rounded={false}
                                padding={2} onClick={handleSaveComment}>
                            {/* Use correct Icon names if different from PostOptions */}
                            <Icon addClass="me-2 save-icon-class" name="floppy" size="15px"/>
                            <span>Save</span> {/* Use English or consistent language */}
                        </Button>
                        <Button mainClass="report-btn w-100" type="button" justifyContent="start" rounded={false}
                                padding={2} onClick={handleReportComment}>
                            <Icon addClass="me-2 report-icon-class" name="flag" size="15px"/>
                            <span>Report</span>
                        </Button>
                        {/* Add other comment options here if needed */}
                    </PopoverMenu>
                </div>
                {/* *** End Options Section *** */}

            </div>

            {/* Reply Input Area */}
            {isReplying && (
                <div className="reply-input-area mt-3 ps-2">
                    <WriteComment
                        postId={postId}
                        // Replace placeholders with actual current user data
                        username="CURRENT_USER_NAME"
                        src="CURRENT_USER_AVATAR_URL"
                        // time="Just now" // Likely better generated server-side
                        parentId={comment.id} // Replying to this comment
                        onCommentSubmit={handlePostReply}
                        onCancel={() => setIsReplying(false)}
                        // isReply={true} // Pass flag if WriteComment needs it for styling/logic
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
                            onReplyPosted={onReplyPosted} // Pass callback down
                        />
                    ))}
                </div>
            )}
        </div>
    );
}