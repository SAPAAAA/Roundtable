// #features/posts/components/PostDetailedView/PostDetailedView.jsx
import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router";

// Import child components and services
import PostHeaderDetailed from "#features/posts/components/PostHeaderDetailed/PostHeaderDetailed";
import PostCore from "#features/posts/components/PostCore/PostCore";
import WriteComment from "#features/posts/components/WriteComment/WriteComment.jsx";
import Comment from "#features/posts/components/Comment/Comment.jsx";
import PostService from "#services/postService";
import {useAuth} from "#hooks/useAuth.jsx";
import "./PostDetailedView.css"; // Component-specific styles

export default function PostDetailedView() {
    const {user} = useAuth(); // Get current user context
    const {postId} = useParams(); // Get postId from URL parameters

    // --- Component State ---
    const [post, setPost] = useState(null);
    const [subtable, setSubtable] = useState(null);
    const [author, setAuthor] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // For loading indicator
    const [error, setError] = useState(null); // For error handling
    const [isWritingTopLevelComment, setIsWritingTopLevelComment] = useState(false); // Controls top-level comment input visibility

    // --- Data Fetching ---
    // Memoized function to fetch all post details (post, author, comments)
    const fetchPostDetails = useCallback(async () => {
        console.log("Fetching post details for postId:", postId);
        setIsLoading(true);
        setError(null);
        try {
            const fetchedData = await PostService.getPostDetails(postId);
            setPost(fetchedData.post);
            setSubtable(fetchedData.subtable);
            setAuthor(fetchedData.author);
            setComments(fetchedData.comments || []); // Ensure comments is always an array
            console.log("Fetched data:", fetchedData);
        } catch (err) {
            console.error("Error fetching post details:", err);
            setError("Failed to load post details. Please try again later.");
            // Clear data on error
            setPost(null);
            setSubtable(null);
            setAuthor(null);
            setComments([]);
        } finally {
            setIsLoading(false);
        }
    }, [postId]); // Re-run only if postId changes

    // --- Effect for Initial Data Fetch ---
    useEffect(() => {
        if (postId) {
            fetchPostDetails();
        }
        // fetchPostDetails is memoized, safe to include
    }, [postId, fetchPostDetails]);

    // --- Comment Handling ---

    // Handles the submission process for any new comment (top-level or reply)
    const handleCommentPosted = async () => {
        try {
            // Refetch comments AFTER successful post to show the new comment
            await fetchPostDetails();

            setIsWritingTopLevelComment(false); // Close top-level input

        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Failed to post comment. Please try again."); // Basic error feedback
        }
    };

    // Callback passed to <Comment> components to trigger refetch after a reply is posted
    const triggerCommentRefetch = async () => {
        console.log("A reply was posted, triggering refetch...");
        await fetchPostDetails(); // Refetch all details
    };

    // --- Navigation ---
    const handleNavigateBack = () => {
        console.log("Navigate back requested");
        window.history.back(); // Browser back action
    };

    // --- Render Logic ---
    if (isLoading) {
        return <div>Loading post...</div>;
    }

    if (error) {
        return <div className="text-danger p-3">{error}</div>;
    }

    // If loading is finished but post is still null (e.g., fetch error handled)
    if (!post) {
        return <div>Post not found or could not be loaded.</div>;
    }

    // --- JSX Output ---
    return (
        <>
            {/* Post Details Area */}
            <div className="post-detailed-container card p-3 my-3">
                <PostHeaderDetailed
                    subtable={subtable}
                    post={post}
                    author={author}
                    onBackClick={handleNavigateBack}
                />
                <PostCore post={post}/>
            </div>

            {/* Top-Level Comment Input */}
            <div className="mb-3 px-3">
                {user ? ( // Show input only if logged in
                    !isWritingTopLevelComment ? (
                        // Collapsed input field
                        <input
                            type="text"
                            className="form-control rounded-pill small-placeholder"
                            placeholder="Add a comment..."
                            onClick={() => setIsWritingTopLevelComment(true)}
                            readOnly // Prevents typing until clicked
                        />
                    ) : (
                        // Expanded WriteComment component
                        <WriteComment
                            subtableName={subtable?.name || ''}
                            postId={post.postId}
                            username={user.username} // Pass username if needed
                            parentCommentId={null} // For top-level comment
                            onCommentSubmit={handleCommentPosted}
                            onCancel={() => setIsWritingTopLevelComment(false)} // Close input on cancel
                        />
                    )
                ) : (
                    // Prompt for non-logged-in users
                    <div className="px-3 text-muted fs-8 mb-3">
                        Log in or sign up to leave a comment
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="px-3">
                {comments && comments.length > 0 ? (
                    // Map over the comments array to render each Comment component
                    comments.map((comment) => (
                        <Comment
                            key={comment.commentId} // Essential for list rendering
                            subtableName={subtable?.name || ''}
                            comment={comment} // Pass the comment data
                            postId={post.postId}
                            // Pass the refetch trigger for replies within the Comment component
                            onReplyPosted={triggerCommentRefetch}
                            currentUser={user} // Pass user info for potential use in Comment (e.g., edit/delete checks)
                        />
                    ))
                ) : (
                    // Message shown when there are no comments (and not loading)
                    !isLoading && post && <div className="text-muted fs-8 mb-3">No comments yet.</div>
                )}
            </div>
        </>
    );
}
