import React from "react";

import ProfileContainer from "../../components/ProfileContainer/ProfileContainer";


function DetailProfile({imgUrl, name, bannerImgUrl, postKarma, commentKarma, createdDay, posts = [], comments = [], savedPosts = [], hiddenPosts = [],upvotedPosts = [], upvotedComments = [], downvotedPosts = [], downvotedComments = [] }) {
    return (
        <ProfileContainer
                        imgUrl={imgUrl}
                        name={name}
                        bannerImgUrl={bannerImgUrl}
                        postKarma={postKarma}
                        commentKarma={commentKarma}
                        createdDay={createdDay}
                        posts= {posts}
                        comments = {comments}
                        savedPosts = {savedPosts}
                        hiddenPosts = {hiddenPosts}
                        upvotedPosts = {upvotedPosts}
                        upvotedComments = {upvotedComments}
                        downvotedPosts = {downvotedPosts}
                        downvotedComments = {downvotedComments}
                    />
    );
}

export default DetailProfile