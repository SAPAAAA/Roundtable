import React, {useEffect} from "react";
import '../myprofile.css';
import UserInfor from "../UserInfor/UserInfor";
import Setting from "../Setting/Setting";
import useSidebar from '#hooks/useSidebar.jsx';

function ProfileSideBar({imgUrl, name, postKarma, commentKarma, createdDay}) {
    const {setSidebarParts} = useSidebar();

    useEffect(() => {
        setSidebarParts({
            header:
                <div>
                    <img src={imgUrl} alt="User Banner" className="profile-banner"/>
                    <div className="profile-name">
                        <h4>{name}</h4>
                    </div>
                    <hr/>
                </div>,
            body:
                <div>
                    <UserInfor
                        postKarma={postKarma}
                        commentKarma={commentKarma}
                        createdDay={createdDay}
                    />
                </div>,
            footer:
                <div>
                    <Setting/>
                </div>
        })
    })
    return (
        <div></div>
        // <div className="profile-sidebar">
        //     <img src={imgUrl} alt="User Banner" className="profile-banner"/>
        //     <div className="profile-name">
        //         <h4>{name}</h4>
        //     </div>
        //     <hr/>
        //     <UserInfor
        //         postKarma={postKarma}
        //         commentKarma={commentKarma}
        //         createdDay={createdDay}
        //     />
        //     <hr/>
        //     <Setting/>
        // </div>
    );
}

export default ProfileSideBar