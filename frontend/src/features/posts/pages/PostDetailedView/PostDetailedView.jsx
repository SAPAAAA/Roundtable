// #features/posts/components/PostDetailedView/PostDetailedView.jsx
import React, {useEffect, useState} from "react";

import PostHeaderDetailed from "#features/posts/components/PostHeaderDetailed/PostHeaderDetailed"; // Adjust path if needed
import PostCore from "#features/posts/components/PostCore/PostCore"; // Adjust path if needed
import WriteComment from "#features/posts/components/WriteComment/WriteComment.jsx";
import Comment from "#features/posts/components/Comment/Comment.jsx";
// import useAuth from '#hooks/auth-hook'; // Example for getting current user
import "./PostDetailedView.css";
import {useParams} from "react-router";
import PostService from "#services/postService";
import {useAuth} from "#hooks/useAuth.jsx"; // Specific styles if needed

export default function PostDetailedView(props) {
    const {user} = useAuth()
    const {subtableName, postId} = useParams()

    // --- State for Top-Level Comment Input ---
    const [isWritingTopLevelComment, setIsWritingTopLevelComment] = useState(false);

    // --- States ---
    const [comments, setComments] = useState([]);
    const [post, setPost] = useState(null);
    const [subtable, setSubtable] = useState(null);
    const [author, setAuthor] = useState(null);

    // --- Fetching/Updating Logic (Example) ---
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const fetchedData = await PostService.getPostDetails(subtableName, postId);
                console.log("Fetched data:", fetchedData);
                setComments(fetchedData.comments);
                setPost(fetchedData.post);
                setSubtable(fetchedData.subtable);
                setAuthor(fetchedData.author);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
        console.log("Comments state updated:", comments);
    }, [subtableName, postId])


    // --- Function to handle NEW comment/reply submission ---
    const handleCommentPosted = async (newCommentData) => {
        console.log("Posting comment data:", newCommentData);
        // --- TODO: API Call Logic ---

        // --- TODO: Update State Logic (Refetch or Add Locally) ---
        alert(`Comment/Reply posted (simulated): ${newCommentData.content}. You would normally refetch comments or update state correctly.`);

        setIsWritingTopLevelComment(false); // Close top-level input if it was open
        // Handle closing reply inputs within Comment components if needed
    };

    // Specific handler for top-level comments
    const handlePostTopLevelComment = async (commentData) => {
        // Ensure parentId is null for top-level, matching original WriteComment usage
        await handleCommentPosted({...commentData, parentId: null});
    };

    // Callback for Comment component to signal update needed after a reply
    const triggerCommentRefetch = () => {
        console.log("A reply was posted, triggering refetch/update...");
    };

    // --- Back Navigation Handler ---
    const handleNavigateBack = () => {
        console.log("Navigate back requested");
        window.history.back(); // Fallback
    };

    console.log("Rendering with comments:", comments); // Add this log

    if (!post) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <>
            {/* Post Area - Uses Refactored Components */}
            <div className="post-detailed-container card p-3 my-3">
                <PostHeaderDetailed
                    subtable={subtable}
                    post={post}
                    author={author}
                    onBackClick={handleNavigateBack}
                    // Pass options handlers if needed
                />
                <PostCore post={post}/>
            </div>

            {/* --- Comment Section - Reverted to Original Structure --- */}

            {/* --- Top-Level Comment Input Area --- */}
            <div className="mb-3 px-3">
                {/* Optional: Check if user is logged in before showing input */}
                {user ? (
                    !isWritingTopLevelComment ? (
                        <input
                            type="text"
                            // Restored original classes: rounded-pill and small-placeholder
                            className="form-control rounded-pill small-placeholder"
                            // Restored original placeholder
                            placeholder="Add a comment..."
                            onClick={() => setIsWritingTopLevelComment(true)}
                            readOnly
                        />
                    ) : (
                        // Use WriteComment as originally intended for top-level
                        <WriteComment
                            subtableName={subtable.name} // Pass subtableName down
                            postId={post.postId}
                            username={user.username}
                            parentId={null} // Explicitly null for top-level
                            onCommentSubmit={handlePostTopLevelComment} // Use the specific handler
                            onCancel={() => setIsWritingTopLevelComment(false)} // Handler to close
                            // Removed isTopLevel={true} prop added during refactoring
                        />
                    )
                ) : (
                    // Kept the logged-out message as it's good practice
                    <div className="px-3 text-muted fs-8 mb-3">
                        Log in or sign up to leave a comment
                    </div>
                )}
            </div>

            {/* --- Render Comment Section using Direct Mapping --- */}
            {/* Check if comments exist and have length */}
            {comments && comments.length > 0 ? (
                console.log("Rendering comments:", comments) || // Log for debugging
                // Container div as in original
                <div className="px-3">
                    {/* Map directly over comments array */}
                    {comments.map((comment) => (
                        <Comment
                            key={comment.commentId}
                            subtableName={subtable.name} // Pass subtableName down
                            comment={comment}
                            postId={post.postId} // Pass postId down
                            // Pass the original callback prop name and function
                            onReplyPosted={triggerCommentRefetch}
                        />
                    ))}
                </div>
            ) : (
                // Display original "No comments yet" message if no comments
                !post ? null : ( // Avoid showing "No comments" while post is loading
                    <div className="px-3 text-muted fs-8 mb-3">
                        No comments yet.
                    </div>
                )
            )}
            {/* --- End Reverted Comment Section --- */}

        </>
    );
}