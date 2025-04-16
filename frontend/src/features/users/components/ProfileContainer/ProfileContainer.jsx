import React, {useState, useEffect} from "react";
import '../myprofile.css'
import Tabs from "../../../../shared/components/UIElement/Tabs/Tabs";
import ProfileSideBar from "../ProfileSidebar/ProfileSidebar";
import ListPostPreview from "../../../posts/components/ListPostPreview/ListPostPreview";
import Comment from "../../../posts/components/Comment/Comment";
import PostPreview from "../../../posts/components/PostPreview/PostPreview";
import Avatar from "../../../../shared/components/UIElement/Avatar/Avatar";
import Identifier from "../../../../shared/components/UIElement/Identifier/Identifier";
import RightSidebar from "../../../../shared/components/layout/RightSidebar/RightSidebar";
import {useSidebar} from '@contexts/SidebarContext.jsx';

function ProfileContainer({imgUrl, name, bannerImgUrl, postKarma, commentKarma, createdDay, posts = [], comments = [], savedPosts = [], hiddenPosts = [],upvotedPosts = [], upvotedComments = [], downvotedPosts = [], downvotedComments = [] }){
    const [activeTab, setActiveTab] = useState("Overview");
    const {setSidebarParts} = useSidebar();

    useEffect(() => {
        setSidebarParts({
            body:   <ProfileSideBar
                        imgUrl={bannerImgUrl}
                        name={name}
                        postKarma={postKarma}
                        commentKarma={commentKarma}
                        createdDay={createdDay}
                    />,
        })
    })
    // const overviewList = [...posts, ...comments].sort(() => Math.random() - 0.5);
    // const upvotedList = [...upvotedPosts, ...upvotedComments].sort(() => Math.random() - 0.5);
    // const downvotedList = [...downvotedPosts, ...downvotedComments].sort(() => Math.random() - 0.5);
    const renderMixedList = (items, tabName) => {
        if (!items || items.length === 0) {
            return <p>No items found.</p>;
        }
    
        return items.map((item) => {
            // Thêm tabName và item.id vào key
            const uniqueKey = `${tabName}-${item.type}-${item.id}`;
            if (item.type === "post") {
                return <PostPreview key={uniqueKey} post={item} />;
            } else if (item.type === "comment") {
                return <Comment key={uniqueKey} comment={item} checkparent={false} />;
            }
            return null;
        });
    };
    
    
    const renderContent = () => {
        switch (activeTab) {
            case "Overview":{
                const overviewList = [...posts, ...comments];
                return (
                    <>
                        <h2>Overview</h2>
                        {renderMixedList(overviewList, "overview")}
                    </>
                );
            }
            case "Posts":{
                return (
                    <>
                        <h2>Posts</h2>
                        <ListPostPreview posts = {posts}/>
                    </>
                );
            }
            case "Comments":{
                return (
                    <>
                        <h2>Comments</h2>
                        {comments.map((comment) => (
                            <Comment key={comment.id} comment={comment} checkparent={false} />
                        ))}
                    </>
                );
            }
            case "Saved":{
                return (
                    <>
                        <h2>Saved</h2>
                        <ListPostPreview posts = {savedPosts}/>
                    </>
                );
            }
            case "Hidden":{
                return (
                    <>
                        <h2>Hidden</h2>
                        <ListPostPreview posts = {hiddenPosts}/>
                    </>
                );
            }
            case "Upvoted":{
                const upvotedList = [...upvotedPosts, ...upvotedComments];
                return (
                    <>
                        <h2>Upvoted</h2>
                        {renderMixedList(upvotedList, "upvoted")}
                    </>
                );
            }
            case "Downvoted":{
                const downvotedList = [...downvotedPosts, ...downvotedComments];
                return (
                    <>
                        <h2>Downvoted</h2>
                        {renderMixedList(downvotedList, "downvoted")}
                    </>
                );
            }
            default:
                return null;
        }
    };
    return(
        <div>
            <div className="profile-container">
                <div className="main-content">
                    <div className="profile-header">
                        <Avatar
                            src={imgUrl} alt={name} mainClass="profile-avatar"
                        />
                        {/* <img src={imgUrl} alt={name} className="profile-avatar"/> */}
                        <div className="profile-info">
                            <h1>{name}</h1>
                            <Identifier type="username" namespace={name}/>
                        </div>
                    </div>
                    <Tabs onTabChange={setActiveTab}/>
                    <div className="profile-main" key={activeTab}>
                        {renderContent()}
                    </div>
                </div>
                {/* <RightSidebar

                /> */}
                {/* <ProfileSideBar
                    imgUrl={bannerImgUrl}
                    name={name}
                    postKarma={postKarma}
                    commentKarma={commentKarma}
                    createdDay={createdDay}
                /> */}
            </div>
        </div>
    )
}
export default ProfileContainer