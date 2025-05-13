import React, { useState, useEffect } from "react";
import { useParams } from 'react-router';
import '../myprofile.css';
import Tabs from "#shared/components/UIElement/Tabs/Tabs";
import OtherProfileSideBar from "#features/users/components/OtherProfileSidebar/OtherProfileSidebar";
import Comment from "#features/posts/components/Comment/Comment";
import PostPreview from "#features/posts/components/PostPreview/PostPreview";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import ProfileService from "#services/profileService";

function ProfileContainer({
    imgUrl,
    name,
    bannerImgUrl,
    postKarma,
    commentKarma,
    createdDay
}) {
    const { userId: paramUserId } = useParams();
    const [activeTab, setActiveTab] = useState("Overview");
    const [profilePosts, setProfilePosts] = useState([]);
    const [profileComments, setProfileComments] = useState([]);
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
                    console.log("Dữ liệu post nhận được từ service:", data);
                    setProfileComments(data);
                };
        fetchPosts();
        fetchComments();
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
                                        // Nếu bạn dùng dạng {post, subtable, ...}
                                        return (
                                            <PostPreview
                                                key={item.post.postId}
                                                post={item.post}
                                                subtable={item.subtable}
                                                isJoined={false}
                                                onJoinClick={() => console.log(`Join clicked for ${item.subtable?.name}`)}
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
                    console.log("profilePosts trước khi map:", profilePosts),
                    <>
                        <h2>Posts</h2>
                        {/* <ListPostPreview posts={posts} /> */}
                        <div className="posts-container">
                            {profilePosts.length > 0 ? (
                                profilePosts.map(postObj => {
                                    // Nếu profilePosts lấy từ service dạng { post: {...}, subtable: {...} }
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
                            <h2>You can't watch this</h2>
                        </>
                    );
                case "Hidden":
                    return (
                        <>
                            <h2>You can't watch this</h2>
                        </>
                    );
                case "Upvoted":
                    return (
                        <>
                            <h2>You can't watch this</h2>
                        </>
                    );     
                case "Downvoted":
                    return (
                        <>
                            <h2>You can't watch this</h2>
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
                <OtherProfileSideBar
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
