import React from "react";
import '../myprofile.css';
import Avatar from "../../../../shared/components/UIElement/Avatar/Avatar";

function AvatarAndName({imgUrl, name}){
    return(
        <div className="profile-header">
            <Avatar
                src={imgUrl} alt={name} mainClass="profile-avatar"
            />
            {/* <img src={imgUrl} alt={name} className="profile-avatar"/> */}
            <div className="profile-info">
                <h1>{name}</h1>
                <p>u/{name}</p>
            </div>
        </div>
    );
}
export default AvatarAndName