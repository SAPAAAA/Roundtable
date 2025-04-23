import ProfileContainer from "#features/users/components/ProfileContainer/ProfileContainer";

const myComments = [
    {
        type: "comment",
        src: "https://picsum.photos/200",
        alt: "avatar",
        username: "nen-goi-la-Hoang",
        time: "2 hours ago",
        content: "Tôi thích chơi R.O.P.O",
        upvotes: 10
    },
    {
        type: "comment",
        src: "https://picsum.photos/200",
        alt: "avatar",
        username: "nen-goi-la-Hoang",
        time: "1 hour ago",
        content: "Ủa ai rảnh không chơi R.E.P.O",
        upvotes: 5
    },
    {
        type: "comment",
        src: "https://picsum.photos/200",
        alt: "avatar",
        username: "nen-goi-la-Hoang",
        time: "30 minutes ago",
        content: "haizz tôi đói quá",
        upvotes: 8
    }
];

const myPosts = [
    {
        type: "post",
        id: 1,
        subtable: {
            avatar: {src: "https://picsum.photos/200"},
            namespace: "subtable1"
        },
        time: "3 hours ago",
        title: "Post Title 1",
        content: "This is the content of post 1.",
        upvotes: 15
    },
    {
        type: "post",
        id: 2,
        subtable: {
            avatar: {src: "https://picsum.photos/200"},
            namespace: "subtable2"
        },
        time: "2 hours ago",
        title: "Post Title 2",
        content: "This is the content of post 2.",
        upvotes: 20
    },
    {
        type: "post",
        id: 3,
        subtable: {
            avatar: {src: "https://picsum.photos/200"},
            namespace: "subtable3"
        },
        time: "1 hour ago",
        title: "Post Title 3",
        content: "This is the content of post 3.",
        upvotes: 25
    }
];

const savedPosts = [
    {
        id: 1,
        subtable: {
            avatar: {src: "https://picsum.photos/100"},
            namespace: "subtable1"
        },
        time: "3 hours ago",
        title: "Post Title 1",
        content: "This is the content of post 1.",
        upvotes: 15
    },
    {
        id: 2,
        subtable: {
            avatar: {src: "https://picsum.photos/300"},
            namespace: "subtable2"
        },
        time: "2 hours ago",
        title: "Post Title 2",
        content: "This is the content of post 2.",
        upvotes: 20
    },
    {
        id: 3,
        subtable: {
            avatar: {src: "https://picsum.photos/400"},
            namespace: "subtable3"
        },
        time: "1 hour ago",
        title: "Post Title 3",
        content: "This is the content of post 3.",
        upvotes: 25
    }
];

const hiddenPosts = [
    {
        id: 1,
        subtable: {
            avatar: {src: "https://picsum.photos/500"},
            namespace: "subtable1"
        },
        time: "3 hours ago",
        title: "Post Title 1",
        content: "This is the content of post 1.",
        upvotes: 15
    },
    {
        id: 2,
        subtable: {
            avatar: {src: "https://picsum.photos/600"},
            namespace: "subtable2"
        },
        time: "2 hours ago",
        title: "Post Title 2",
        content: "This is the content of post 2.",
        upvotes: 20
    },
    {
        id: 3,
        subtable: {
            avatar: {src: "https://picsum.photos/700"},
            namespace: "subtable3"
        },
        time: "1 hour ago",
        title: "Post Title 3",
        content: "This is the content of post 3.",
        upvotes: 25
    }
];

const upvotedPosts = [
    {
        type: "post",
        id: 101,
        subtable: {
            avatar: {src: "https://picsum.photos/400"},
            namespace: "subtable3"
        },
        time: "5 hours ago",
        title: "Post Title A",
        content: "This is the content of post A.",
        upvotes: 50,
        voteStatus: "upvoted"
    },
    {
        type: "post",
        id: 102,
        subtable: {
            avatar: {src: "https://picsum.photos/500"},
            namespace: "subtable4"
        },
        time: "6 hours ago",
        title: "Post Title B",
        content: "This is the content of post B.",
        upvotes: 30,
        voteStatus: "upvoted"
    }
];

const upvotedComments = [
    {
        type: "comment",
        src: "https://picsum.photos/100",
        alt: "avatar",
        username: "user1",
        time: "2 hours ago",
        content: "I love programming!",
        upvotes: 10,
        voteStatus: "upvoted"
    },
    {
        type: "comment",
        src: "https://picsum.photos/300",
        alt: "avatar",
        username: "user2",
        time: "1 hour ago",
        content: "JavaScript is amazing!",
        upvotes: 5,
        voteStatus: "upvoted"
    }
];

const downvotedPosts = [
    {
        type: "post",
        id: 201,
        subtable: {
            avatar: {src: "https://picsum.photos/600"},
            namespace: "subtable5"
        },
        time: "7 hours ago",
        title: "Post Title C",
        content: "This is the content of post C.",
        upvotes: 25,
        voteStatus: "downvoted"
    },
    {
        type: "post",
        id: 202,
        subtable: {
            avatar: {src: "https://picsum.photos/700"},
            namespace: "subtable6"
        },
        time: "8 hours ago",
        title: "Post Title D",
        content: "This is the content of post D.",
        upvotes: 10,
        voteStatus: "downvoted"
    }
];

const downvotedComments = [
    {
        type: "comment",
        src: "https://picsum.photos/800",
        alt: "avatar",
        username: "user3",
        time: "3 hours ago",
        content: "I dislike this approach.",
        upvotes: 2,
        voteStatus: "downvoted"
    },
    {
        type: "comment",
        src: "https://picsum.photos/900",
        alt: "avatar",
        username: "user4",
        time: "4 hours ago",
        content: "This is not helpful.",
        upvotes: 1,
        voteStatus: "downvoted"
    }
];

function PostRoutes() {
    return [
        {
            path: "Profile",
            element:
                <div>
                    <ProfileContainer
                        imgUrl="https://picsum.photos/200"
                        name="nen-goi-la-Hoang"
                        bannerImgUrl="https://picsum.photos/300/100?grayscale"
                        postKarma="1"
                        commentKarma="0"
                        createdDay="Feb 19, 2025"
                        posts={myPosts}
                        comments={myComments}
                        savedPosts={savedPosts}
                        hiddenPosts={hiddenPosts}
                        upvotedPosts={upvotedPosts}
                        upvotedComments={upvotedComments}
                        downvotedPosts={downvotedPosts}
                        downvotedComments={downvotedComments}
                    />
                </div>

        }
    ];
}

export default PostRoutes;