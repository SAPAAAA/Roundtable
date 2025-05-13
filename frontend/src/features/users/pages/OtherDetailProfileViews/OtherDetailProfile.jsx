import OtherProfileContainer from "#features/users/components/OtherProfileContainer/OtherProfileContainer";


function OtherDetailProfile({imgUrl, name, bannerImgUrl, postKarma, commentKarma, createdDay, posts = [], comments = [], savedPosts = [], hiddenPosts = [],upvotedPosts = [], upvotedComments = [], downvotedPosts = [], downvotedComments = [] }) {
    return (
        <OtherProfileContainer
                        imgUrl={imgUrl}
                        name={name}
                        bannerImgUrl={bannerImgUrl}
                        postKarma={postKarma}
                        commentKarma={commentKarma}
                        createdDay={createdDay}
                        posts= {posts}
                        comments = {comments}
                    />
    );
}

export default OtherDetailProfile