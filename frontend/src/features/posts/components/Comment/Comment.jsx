// posts/components/Comment/Comment.jsx
import React, {useState} from "react"; // No useCallback needed here for now
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/posts/components/WriteComment/WriteComment";
import PopoverMenu from "#shared/components/UIElement/PopoverMenu/PopoverMenu";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import {formatTimeAgo} from "#utils/time";

import './Comment.css';

export default function Comment(props) {
    const {
        comment,
        postId,
        subtableName,
        onReplyPosted
    } = props;

    const [isReplying, setIsReplying] = useState(false);
    // --- NEW STATE ---
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // ... (useVote hook remains the same) ...
    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote(
        {initialCount: comment.voteCount, initialVoteStatus: comment.userVoteStatus ?? null},
        comment.commentId,
        'comment'
    );

    const handleReplyClick = () => {
        setIsReplying(prev => !prev);
    };

    const handlePostReply = () => {
        setIsReplying(false);
        if (onReplyPosted) {
            onReplyPosted();
        }
    };

    const handleSaveComment = () => {
        console.log(`Save comment clicked: ${comment.commentId}`);
    };

    const handleReportComment = () => {
        console.log(`Report comment clicked: ${comment.commentId}`);
    };

    // --- NEW CALLBACKS for Popover ---
    const handlePopoverOpen = () => {
        setIsPopoverOpen(true);
    };

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    };

    const isReply = !!comment.parentCommentId;

    // --- Conditional Class ---
    const commentComponentClasses = `
        comment-component card p-3 my-2
        ${isReply ? 'comment-reply' : ''}
        ${isPopoverOpen ? 'popover-is-open' : ''}
    `.trim().replace(/\s+/g, ' '); // Clean up whitespace

    return (
        <div className={`comment-thread-item ${isReply ? 'is-reply-item' : ''}`}>
            {/* --- Use the conditional class string --- */}
            <div className={commentComponentClasses}>
                {/* ... (Comment Details - Avatar, Identifier, Body) ... */}
                <div className="d-flex align-items-center mb-2">
                    <Avatar
                        src={comment.author.avatar}
                        alt={
                            <Identifier
                                type="user"
                                namespace={comment.author.username}/>
                        }
                        width={20}
                        height={20}/>
                    <div className="d-flex flex-row flex-wrap fs-8">
                        <Identifier
                            addClass="ms-2 fw-bold"
                            type="user"
                            namespace={comment.author.username}/>
                        &nbsp;•&nbsp;
                        <span className="text-muted">{formatTimeAgo(comment.commentCreatedAt)}</span>
                    </div>
                </div>
                <div className="fs-content mt-2 mb-2">{comment.body}</div>


                {/* Actions */}
                <div className="d-flex align-items-center gap-2 mt-2">
                    {/* ... (Vote, Reply, Share containers) ... */}
                    {voteError && <div className="text-danger fs-icon me-2">Error: {voteError}</div>}
                    {/* Vote Container */}
                    <div
                        className={`vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-light p-1`}>
                        <Button
                            mainClass="upvote-btn" contentType="icon"
                            dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Upvote"
                            tooltipPlacement="top"
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
                    <div className="reply-container d-flex align-items-center rounded-pill gap-1 bg-light p-1">
                        <Button
                            mainClass="reply-btn"
                            dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Reply"
                            tooltipPlacement="top"
                            padding="1"
                            onClick={handleReplyClick}
                        >
                            <Icon mainClass="comment-icon" name="comment" size="15px"/>
                            <span className="ms-1 fs-icon">Reply</span>
                        </Button>
                    </div>

                    {/* Share Container */}
                    <div className="share-container d-flex align-items-center rounded-pill gap-1 bg-light p-1">
                        <Button
                            mainClass="share-btn"
                            dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="Share"
                            tooltipPlacement="top"
                            padding="1"
                            onClick={() => console.log('Share comment clicked')}
                        >
                            <Icon mainClass="share-icon" name="share" size="15px"/>
                            <span className="ms-1 fs-icon">Share</span>
                        </Button>
                    </div>


                    {/* Options using PopoverMenu */}
                    <div className="option-container d-flex align-items-center">
                        <PopoverMenu
                            mainClass="option-menu"
                            addClass="bg-white rounded shadow-sm border"
                            position="bottom-end"
                            // --- Pass Callbacks ---
                            onMenuOpen={handlePopoverOpen}
                            onMenuClose={handlePopoverClose}
                            trigger={
                                <Button /* ... trigger button props ... */
                                    mainClass="option-btn" contentType="icon" padding="2" roundedPill
                                    addClass="bg-light"
                                    dataBsToggle="tooltip" dataBsTrigger="hover focus" tooltipTitle="More options"
                                    tooltipPlacement="top"
                                    ariaLabel="Comment Options"
                                >
                                    <Icon mainClass="option-icon" name="three_dots" size="15px"/>
                                </Button>
                            }
                        >
                            {/* ... PopoverMenu children (Save/Report Buttons) ... */}
                            <Button mainClass="save-btn w-100" type="button" justifyContent="start" rounded={false}
                                    padding={2} onClick={handleSaveComment}>
                                <Icon addClass="me-2 save-icon-class" name="floppy" size="15px"/>
                                <span>Lưu</span>
                            </Button>
                            <Button mainClass="report-btn w-100" type="button" justifyContent="start" rounded={false}
                                    padding={2} onClick={handleReportComment}>
                                <Icon addClass="me-2 report-icon-class" name="flag" size="15px"/>
                                <span>Báo cáo</span>
                            </Button>
                        </PopoverMenu>
                    </div>
                </div>

                {/* ... (Reply Input Area) ... */}
                {isReplying && (
                    <div className="reply-input-area mt-3">
                        <WriteComment
                            subtableName={subtableName}
                            postId={postId}
                            username="CURRENT_USER_NAME"
                            src="CURRENT_USER_AVATAR_URL"
                            parentId={comment.commentId}
                            onCommentSubmit={handlePostReply}
                            onCancel={() => setIsReplying(false)}
                        />
                    </div>
                )}

            </div>
            {/* End of comment-component */}

            {/* ... (Replies rendering) ... */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies ps-4">
                    {comment.replies.map(reply => (
                        <Comment
                            key={reply.commentId}
                            comment={reply}
                            postId={postId}
                            subtableName={subtableName}
                            onReplyPosted={onReplyPosted}
                        />
                    ))}
                </div>
            )}
        </div> // End of comment-thread-item
    );
}