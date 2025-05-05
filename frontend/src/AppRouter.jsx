import React, {lazy} from "react";
import {createBrowserRouter, RouterProvider} from "react-router";

// Lazy-loaded pages
const MainLayout = lazy(() => import('@layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('@pages/Home/HomeContent/HomeContent'));
const Login = lazy(() => import('@features/auth/pages/Login/Login'));
const Register = lazy(() => import('@features/auth/pages/Register/Register'));
const PostDetail = lazy(() => import('@features/posts/pages/PostDetail/PostDetail'));
const ErrorPageNotFound = lazy(() => import('@pages/ErrorPageNotFound/ErrorPageNotFound'));
const Error404 = lazy(() => import('@pages/Error404/Error404'));
const ProfileContainer = lazy(() => import('@features/users/components/ProfileContainer/ProfileContainer'));
const DetailProfile = lazy(() => import('@features/users/pages/views/DetailProfile'));

const post =
    {
        id: 1, // Let's assume you added an ID for the hook
        subtable: {
            namespace: "CodeTalk",
            avatar: {
                src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
            }
        },
        username: "Mai Đức Kiên",
        time: "3 hr. ago",
        title: "What is the best programming language to learn?",
        content: "I'm new to programming and want to learn a new language...",
        upvotes: 750,
        comments: 150,
    }
;

const comments = [
    {
        id: 1,
        username: "John Doe",
        src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        alt: "Ảnh này bị hư",
        time: "5 min. ago",
        content: "That's a great question! I'd say Python is great for web development.",
        upvotes: 2,
        parentId: null, // Comment cha
    },
    {
        id: 2,
        username: "Alice Smith",
        src: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&q=80",
        alt: "Ảnh bị hư",
        time: "3 min. ago",
        content: "I agree! Python is very flexible and easy to learn.",
        upvotes: 5,
        parentId: 1, // Comment con của ID 1
    },
    {
        id: 3,
        username: "Bob Johnson",
        src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
        alt: "Ảnh bị hư",
        time: "10 min. ago",
        content: "What about JavaScript? I think it's also powerful for web dev.",
        upvotes: 3,
        parentId: null, // Comment cha
    },
    {
        id: 4,
        username: "Emily Davis",
        src: "https://images.unsplash.com/photo-1522071901873-411886a10004?w=100&q=80",
        alt: "Ảnh bị hư",
        time: "7 min. ago",
        content: "Yes! JavaScript is amazing, especially with React and Node.js.",
        upvotes: 4,
        parentId: 3, // Comment con của ID 3
    },
    {
        id: 5, // 👈 Bình luận mới
        username: "Michael Brown",
        src: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80",
        alt: "Ảnh bị hư",
        time: "2 min. ago",
        content: "I also love Python! It’s great for data science as well.",
        upvotes: 3,
        parentId: 1, // Bình luận con của ID 1
    }
];

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
            avatar: { src: "https://picsum.photos/200" },
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
            avatar: { src: "https://picsum.photos/200" },
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
            avatar: { src: "https://picsum.photos/200" },
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
            avatar: { src: "https://picsum.photos/100" },
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
            avatar: { src: "https://picsum.photos/300" },
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
            avatar: { src: "https://picsum.photos/400" },
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
            avatar: { src: "https://picsum.photos/500" },
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
            avatar: { src: "https://picsum.photos/600" },
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
            avatar: { src: "https://picsum.photos/700" },
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
            avatar: { src: "https://picsum.photos/400" },
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
            avatar: { src: "https://picsum.photos/500" },
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
            avatar: { src: "https://picsum.photos/600" },
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
            avatar: { src: "https://picsum.photos/700" },
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

const router = createBrowserRouter([
    {
        element: <MainLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: "comment",
                element: <Home/>
            },
            {
                path: "post",
                element: <PostDetail post={post} comments={comments}/>,
            },
            {
                path: "Profile",
                element:
                <DetailProfile
                        imgUrl="https://picsum.photos/200"
                        name="nen-goi-la-Hoang"
                        bannerImgUrl="https://picsum.photos/300/100?grayscale"
                        postKarma="1"
                        commentKarma="0"
                        createdDay="Feb 19, 2025"
                        posts= {myPosts}
                        comments = {myComments}
                        savedPosts = {savedPosts}
                        hiddenPosts = {hiddenPosts}
                        upvotedPosts = {upvotedPosts}
                        upvotedComments = {upvotedComments}
                        downvotedPosts = {downvotedPosts}
                        downvotedComments = {downvotedComments}
                    /> 
                
            }
        ],
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/404",
        element: <Error404/>
    },
    {
        path: "*",
        element: <ErrorPageNotFound/>
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router}/>;
}