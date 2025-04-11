import React from "react";
import '../myprofile.css'
import Avatar from "../Avatar/Avatar";
import Tabs from "../Tabs/Tabs";
import ProfileSideBar from "../ProfileSidebar/ProfileSidebar";

function ProfileContainer({imgUrl, name, bannerImgUrl, postKarma, commentKarma, createdDay}){
    return(
        <div>
            <div className="profile-container">
                <div className="main-content">
                    <Avatar
                        imgUrl={imgUrl}
                        name={name}
                    />
                    <Tabs/>
                    <div className="profile-main">
                        <h2>Overview</h2>
                        <p>u/nen-goi-la-Hoang hasn't posted yet</p>
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
    )
}
export default ProfileContainer