import React from "react";

import ProfileContainer from "../users/components/ProfileContainer";


function DetailProfile({imgUrl, name, postKarma, commentKarma, createdDay}) {
    return (
        <ProfileContainer
            imgUrl={imgUrl}
            name={name}
            postKarma={postKarma}
            commentKarma={commentKarma}
            createdDay={createdDay}
        />
    );
}

export default DetailProfile