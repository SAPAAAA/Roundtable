import React, {useEffect, useState} from "react"; // Removed useMemo, added useEffect if refetching
import "./PostDetail.css";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import PopoverMenu from "#shared/components/UIElement/PopoverMenu/PopoverMenu";
import useVote from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/posts/components/WriteComment/WriteComment.jsx";
import Comment from "#features/posts/components/Comment/Comment.jsx";

export default function PostDetail(props) {
    // Assuming props.post and props.comments (nested) are provided
    const {post} = props;
    // Manage comments in state to allow updates after posting
    const [comments, setComments] = useState(props.comments || []);

    // Optional: Refetch comments if props.comments changes externally
    useEffect(() => {
        setComments(props.comments || []);
    }, [props.comments]);


    // --- Vote Hook for the Post ---
    const {
        voteStatus, voteCount, isVoting, voteError, handleUpvote, handleDownvote
    } = useVote({initialCount: post.upvotes, initialVoteStatus: null}, post.id);

    // --- Share Handler ---
    const handleShare = () => { /* ... as before ... */
    };
    const handleSavePost = () => console.log("Save action triggered");
    const handleHidePost = () => console.log("Hide action triggered");
    const handleReportPost = () => console.log("Report action triggered");

    // --- State for Top-Level Comment Input ---
    const [isWritingTopLevelComment, setIsWritingTopLevelComment] = useState(false);

    // --- Function to handle NEW comment/reply submission ---
    // This function needs to be passed down or handled via context/state management
    // It simulates updating the state after a comment is posted.
    // Replace with your actual API call and state update logic.
    const handleCommentPosted = async (newCommentData) => {
        console.log("Posting comment data:", newCommentData);
        // --- TODO: API Call Logic ---

        // --- End TODO ---

        // --- TODO: Update State Logic ---

        alert(`Comment posted (simulated): ${newCommentData.content}. You would normally refetch comments here.`);

        // --- End TODO ---
    };

    // Specific handler for top-level comments
    const handlePostTopLevelComment = async (commentData) => {
        await handleCommentPosted(commentData); // Call the general handler
        setIsWritingTopLevelComment(false); // Close input specific to top-level
    };

    // Callback for Comment component to signal update needed
    const triggerCommentRefetch = () => {
        console.log("A reply was posted, triggering refetch/update...");
        // Call your actual function to refetch comments for the post
        // e.g., refetchComments(post.id);
        alert("Reply posted (simulated). You would normally refetch comments here.");
    }

    return (
        <>
            <div className="p-3 my-3">
                {/* --- Post Header --- */}
                <div className="d-flex align-items-center mb-2 justify-content-between">
                    {/* Left side */}
                    <div className="d-flex align-items-center">
                        <Button href='/' contentType="icon" ariaLabel="Back">
                            <Icon mainClass="back-icon" name="arrow_left" size="15px"/>
                        </Button>
                        &nbsp;
                        <Avatar src={post.subtable.avatar.src} alt={`r/${post.subtable.namespace}`} width={20}
                                height={20}/>
                        <div className="d-flex flex-row flex-wrap fs-8">
                            <Identifier addClass="underline ms-2" type="subtable" namespace={post.subtable.namespace}/>
                            &nbsp;•&nbsp;
                            <span className="text-muted">{post.time}</span>
                            {post.username && <div className="w-100 underline ms-2">{post.username}</div>}
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
                        <PopoverMenu mainClass="option-menu" addClass="bg-white rounded" position="bottom-end"
                                     trigger={<Button mainClass="option-btn" contentType="icon" padding="2"
                                                      ariaLabel="Post Options"> <Icon mainClass="option-icon"
                                                                                      name="three_dots" size="15px"/>
                                     </Button>}>
                            <Button mainClass="save-btn" type="button" justifyContent="start" rounded={false}
                                    onClick={handleSavePost}> <Icon addClass="me-2" name="floppy"
                                                                    size="15px"/><span>Lưu</span> </Button>
                            <Button mainClass="hide-btn" type="button" justifyContent="start" rounded={false}
                                    onClick={handleHidePost}> <Icon addClass="me-2" name="hide"
                                                                    size="15px"/><span>Ẩn</span> </Button>
                            <Button mainClass="report-btn" type="button" justifyContent="start" rounded={false}
                                    onClick={handleReportPost}> <Icon addClass="me-2" name="flag" size="15px"/><span>Báo cáo</span>
                            </Button>
                        </PopoverMenu>
                    </div>
                </div>

                {/* --- Post Title & Content --- */}
                <h5 className="fw-bold">{post.title}</h5>
                <p>{post.content}</p>

                {/* --- Post Actions (Vote, Share) --- */}
                <div className="post-actions-container d-flex align-items-center gap-2 mb-3">
                    {voteError && <div className="text-danger fs-8 me-2">Error: {voteError}</div>}
                    {/* Vote Buttons */}
                    <div
                        className={`post-actions vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-white`}>
                        <Button mainClass="upvote-btn" contentType="icon" dataBsToggle="tooltip"
                                dataBsTrigger="hover focus" tooltipTitle="Upvote" tooltipPlacement="top" padding="2"
                                onClick={handleUpvote} disabled={isVoting}> <Icon mainClass="upvote-icon"
                                                                                  name={voteStatus === "upvoted" ? "upvoted" : "upvote"}
                                                                                  size="15px"/> </Button>
                        <span className="fs-8">{voteCount}</span>
                        <Button mainClass="downvote-btn" contentType="icon" dataBsToggle="tooltip"
                                dataBsTrigger="hover focus" tooltipTitle="Downvote" tooltipPlacement="top" padding="2"
                                onClick={handleDownvote} disabled={isVoting}> <Icon mainClass="downvote-icon"
                                                                                    name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                                                                                    size="15px"/> </Button>
                    </div>
                    {/* Share Button */}
                    <div className="post-actions share-container d-flex align-items-center rounded-pill gap-2 bg-white">
                        <Button mainClass="share-btn" contentType="icon" dataBsToggle="tooltip"
                                dataBsTrigger="hover focus" tooltipTitle="Share" tooltipPlacement="top" padding="2"
                                onClick={handleShare}> <Icon mainClass="share-icon" name="share" size="15px"/> </Button>
                    </div>
                </div>
            </div>

            {/* --- Top-Level Comment Input Area --- */}
            <div className="mb-3 px-3">
                {!isWritingTopLevelComment ? (
                    <input
                        type="text"
                        className="form-control rounded-pill small-placeholder"
                        placeholder="Add a comment..."
                        onClick={() => setIsWritingTopLevelComment(true)}
                        readOnly
                    />
                ) : (
                    // Use the modified WriteComment here
                    <WriteComment
                        postId={post.id}
                        username="CURRENT_USER_NAME" // Replace with actual logged-in user
                        src="CURRENT_USER_AVATAR_URL" // Replace with actual logged-in user avatar
                        time="Just now" // Consider generating server-side
                        parentId={null} // Explicitly null for top-level
                        onCommentSubmit={handlePostTopLevelComment} // Use the specific handler
                        onCancel={() => setIsWritingTopLevelComment(false)} // Handler to close
                    />
                )}
            </div>

            {/* --- Render Comment Section using Hierarchical Component --- */}
            {comments && comments.length > 0 && (
                <div className="px-3">
                    {comments.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            postId={post.id} // Pass postId down
                            onReplyPosted={triggerCommentRefetch} // Pass callback down
                        />
                    ))}
                </div>
            )}
            {/* Display message if there are no comments */}
            {(!comments || comments.length === 0) && (
                <div className="px-3 text-muted fs-8 mb-3">
                    No comments yet.
                </div>
            )}
        </>
    );
}