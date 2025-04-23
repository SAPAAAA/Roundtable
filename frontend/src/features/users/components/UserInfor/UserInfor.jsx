import React from "react";
import '../myprofile.css';

function UserInfor({postKarma, commentKarma, createdDay}) {
    return (
        <div>
            <div className="karma">
                <div className="karma-item">
                    <h3>Post karma</h3>
                    <p>{postKarma}</p>
                </div>
                <div className="karma-item">
                    <h3>Comment karma</h3>
                    <p>{commentKarma}</p>
                </div>
            </div>
            <hr/>
            <div className="created-day">
                <h3>Created day</h3>
                <p>{createdDay}</p>
            </div>
        </div>
    );
}

export default UserInfor