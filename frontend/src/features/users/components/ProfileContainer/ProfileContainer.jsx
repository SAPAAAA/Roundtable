import React, { useState, useEffect } from "react";
import { useParams } from 'react-router';
import '../myprofile.css';
import Tabs from "#shared/components/UIElement/Tabs/Tabs";
import ProfileSideBar from "#features/users/components/ProfileSidebar/ProfileSidebar";
import Comment from "#features/posts/components/Comment/Comment";
import PostPreview from "#features/posts/components/PostPreview/PostPreview";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import ProfileService from "#services/profileService";
import { useNavigate } from 'react-router';

function ProfileContainer({
    imgUrl,
    name,
    bannerImgUrl,
    postKarma,
    commentKarma,
    createdDay
}) {

    const { userId: paramUserId } = useParams();
    
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Overview");
    const [profilePosts, setProfilePosts] = useState([]);
    const [profileComments, setProfileComments] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [hiddenPosts, setHiddenPosts] = useState([]);
    const [upvotedPosts, setUpvotedPosts] = useState([]);
    const [upvotedComments, setUpvotedComments] = useState([]);
    const [downvotedPosts, setDownvotedPosts] = useState([]);
    const [downvotedComments, setDownvotedComments] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await ProfileService.getPostsByUserId(paramUserId);
                console.log("Dữ liệu nhận được từ service:", data);
                setProfilePosts(data);
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        const fetchComments = async () => {
            const data = await ProfileService.getCommentsByUserId(paramUserId);
            setProfileComments(data);
        };
        const fetchSavedPosts = async () => {
            const data = await ProfileService.getSavedPostsByUserId(paramUserId);
            setSavedPosts(data);
        };
        const fetchHiddenPosts = async () => {
            const data = await ProfileService.getHiddenPostsByUserId(paramUserId);
            setHiddenPosts(data);
        };
        const fetchVotedItems = async () => {
            try {
                const upPosts = await ProfileService.getUpvotedPosts(paramUserId);
                const upComments = await ProfileService.getUpvotedComments(paramUserId);
                const downPosts = await ProfileService.getDownvotedPosts(paramUserId);
                const downComments = await ProfileService.getDownvotedComments(paramUserId);
    
                setUpvotedPosts(upPosts);
                setUpvotedComments(upComments);
                setDownvotedPosts(downPosts);
                setDownvotedComments(downComments);
            } catch (error) {
                console.error("Error fetching voted items:", error);
            }
        };  
        fetchPosts();
        fetchComments();
        fetchSavedPosts();
        fetchHiddenPosts();
        fetchVotedItems();
    }, [paramUserId]);

    const overviewList = [
        ...profilePosts.map(postObj => ({
            ...postObj,
            type: "post",
            createdAt: postObj.post.createdAt || postObj.post.time
        })),
        ...profileComments.map(comment => ({
            ...comment,
            type: "comment",
            createdAt: comment.commentCreatedAt
        }))
    ];
    overviewList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const upvotedList = [
        ...upvotedPosts.map(post => ({ 
            ...post, 
            type: "post",
            createdAt: post.createdAt || post.post?.createdAt 
        })),
        ...upvotedComments.map(comment => ({ 
            ...comment, 
            type: "comment",
            createdAt: comment.createdAt || comment.commentCreatedAt 
        }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const downvotedList = [
        ...downvotedPosts.map(post => ({ 
            ...post, 
            type: "post",
            createdAt: post.createdAt || post.post?.createdAt 
        })),
        ...downvotedComments.map(comment => ({ 
            ...comment, 
            type: "comment",
            createdAt: comment.createdAt || comment.commentCreatedAt 
        }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const handlePostClick = (postId, subtableId) => {
        navigate(`/s/${subtableId}/posts/${postId}`);
    };

    const renderContent = () => {
        if (loading) return <div>Đang tải dữ liệu...</div>;
        switch (activeTab) {
            case "Overview":
                return (
                    <>
                        <h2>Overview</h2>
                        <div className="overview-list">
                            {overviewList.length > 0 ? (
                                overviewList.map(item => {
                                    if (item.type === "post") {
                                        return (
                                            <PostPreview
                                                key={item.post.postId}
                                                post={item.post}
                                                subtable={item.subtable}
                                                isJoined={false}
                                                onJoinClick={() => console.log(`Join clicked for ${item.subtable?.name}`)}
                                                onClick={() => handlePostClick(item.post.postId, item.subtable.subtableId)}
                                            />
                                        );
                                    } else if (item.type === "comment") {
                                        return (
                                            <Comment
                                                key={item.commentId}
                                                comment={item}
                                                checkparent={false}
                                            />
                                        );
                                    }
                                    return null;
                                })
                            ) : (
                                <div>Không có bài viết hoặc bình luận nào.</div>
                            )}
                        </div>
                    </>
                );
            case "Posts":
                return (
                    <>
                        <h2>Posts</h2>
                        {/* <ListPostPreview posts={posts} /> */}
                        <div className="posts-container">
                            {profilePosts.length > 0 ? (
                                profilePosts.map(postObj => {
                                    const { post, subtable } = postObj;
                                    return (
                                        <PostPreview
                                            key={post.postId}
                                            post={post}
                                            subtable={subtable}
                                            isJoined={false}
                                            onJoinClick={() => console.log(`Join clicked for ${subtable?.name}`)}
                                        />
                                    );
                                })
                            ) : (
                                <div>Không có bài viết nào.</div>
                            )}
                        </div>

                    </>
                );
                case "Comments":
                    return (
                        <>
                            <h2>Comments</h2>
                            {profileComments.length > 0 ? (
                                profileComments.map(comment => (
                                    <Comment
                                        key={comment.commentId}
                                        comment={comment}
                                        subtableName={comment.subtableName}
                                        onReplyPosted={() => {/* callback nếu cần */}}
                                    />
                                ))
                            ) : (
                                <div>Không có bình luận nào.</div>
                            )}
                        </>
                    );
                case "Saved":
                    return (
                        <>
                            <h2>Saved Posts</h2>
                            <div className="posts-container">
                                {savedPosts.length > 0 ? (
                                    savedPosts.map(postObj => {
                                        const { post, subtable } = postObj;
                                        return (
                                            <PostPreview
                                                key={post.postId}
                                                post={post}
                                                subtable={subtable}
                                                isJoined={false}
                                                onJoinClick={() => console.log(`Join clicked for ${subtable?.name}`)}
                                            />
                                        );
                                    })
                                ) : (
                                    <div>Không có bài viết nào.</div>
                                )}
                            </div>
                        </>
                    );
                case "Hidden":
                    return (
                        <>
                            <h2>Hidden Posts</h2>
                            <div className="posts-container">
                                {hiddenPosts.length > 0 ? (
                                    hiddenPosts.map(postObj => {
                                        const { post, subtable } = postObj;
                                        return (
                                            <PostPreview
                                                key={post.postId}
                                                post={post}
                                                subtable={subtable}
                                                isJoined={false}
                                                onJoinClick={() => console.log(`Join clicked for ${subtable?.name}`)}
                                            />
                                        );
                                    })
                                ) : (
                                    <div>Không có bài viết nào.</div>
                                )}
                            </div>
                        </>
                    );
                case "Upvoted":
                    return (
                        <>
                            <h2>Upvoted</h2>
                            <div className="mixed-list">
                                {upvotedList.length > 0 ? (
                                    upvotedList.map(item => {
                                        if (item.type === "post") {
                                            return (
                                                <PostPreview
                                                    key={item.postId}
                                                    post={item.post || item} // Xử lý cả 2 trường hợp data structure
                                                    subtable={item.subtable}
                                                />
                                            );
                                        } else {
                                            return (
                                                <Comment
                                                    key={item.commentId}
                                                    comment={item}
                                                    checkparent={false}
                                                />
                                            );
                                        }
                                    })
                                ) : (
                                    <div>Chưa upvote bài viết/bình luận nào.</div>
                                )}
                            </div>
                        </>
                    );     
                case "Downvoted":
                    return (
                        <>
                            <h2>Downvoted</h2>
                            <div className="mixed-list">
                                {downvotedList.length > 0 ? (
                                    downvotedList.map(item => {
                                        if (item.type === "post") {
                                            return (
                                                <PostPreview
                                                    key={item.postId}
                                                    post={item.post || item}
                                                    subtable={item.subtable}
                                                />
                                            );
                                        } else {
                                            return (
                                                <Comment
                                                    key={item.commentId}
                                                    comment={item}
                                                    checkparent={false}
                                                />
                                            );
                                        }
                                    })
                                ) : (
                                    <div>Chưa downvote bài viết/bình luận nào.</div>
                                )}
                            </div>
                        </>
                    );                                   
            default:
                return null;
        }
    };    

    return (
        <div>
            <div className="profile-container">
                <div className="main-content">
                    <div className="profile-header">
                        <Avatar
                            src={imgUrl} 
                            alt={name} 
                            mainClass="profile-avatar"
                        />
                        <div className="profile-info">
                            <h1>{name}</h1>
                            <Identifier type="username" namespace={name} />
                        </div>
                    </div>
                    <Tabs onTabChange={setActiveTab} />
                    <div className="profile-main" key={activeTab}>
                        {renderContent()}
                    </div>
                </div>
                <ProfileSideBar
                    imgUrl={bannerImgUrl}
                    name={name}
                    postKarma={postKarma}
                    commentKarma={commentKarma}
                    createdDay={createdDay}
                />
            </div>
        </div>
    );
}

export default ProfileContainer;
