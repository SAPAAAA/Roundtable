import React from "react";
import '../myprofile.css'
import Avatar from "../Avatar/Avatar";
import Tabs from "../Tabs/Tabs";

function ProfileContainer({imgUrl, name}){
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
            </div>
        </div>
    )
}
export default ProfileContainer