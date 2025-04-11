import React from "react";
import '../myprofile.css';

function Avatar({imgUrl, name}){
    return(
        <div className="profile-header">
            <img src={imgUrl} alt={name} className="profile-avatar"/>
            <div className="profile-info">
                <h1>{name}</h1>
                <p>u/{name}</p>
            </div>
        </div>
    );
}
export default Avatar