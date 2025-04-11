import React from "react";
import '../myprofile.css';
import UserInfor from "../UserInfor/UserInfor";
import Setting from "../Setting/Setting";

function ProfileSideBar({imgUrl, name, postKarma, commentKarma, createdDay}){
    return(
        <div className="profile-sidebar">
            <img src={imgUrl} alt="User Banner" className="profile-banner"/>
            <div className="profile-name">
                <h4>{name}</h4>
            </div>
            <hr/>
            <UserInfor
                postKarma={postKarma}
                commentKarma={commentKarma}
                createdDay={createdDay}
            />
            <hr/>
            <Setting/>
        </div>
    );
}

export default ProfileSideBar