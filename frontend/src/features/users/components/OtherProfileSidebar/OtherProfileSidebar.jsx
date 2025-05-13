import React, {useEffect} from "react";
import '../myprofile.css';
import UserInfor from "#features/users/components/UserInfor/UserInfor";
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
                    <button className="button-8 me-2" role="button">Follow</button>
                    <button className="button-8" role="button">Block</button>
                </div>
        })
    }, [imgUrl, name, postKarma, commentKarma, createdDay, setSidebarParts])
    return (
        <div></div>
    );
}

export default ProfileSideBar