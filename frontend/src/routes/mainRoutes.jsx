import React, {lazy} from 'react';

// Lazy-loaded components for this section
const MainLayout = lazy(() => import('@layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('@pages/Home/HomeContent/HomeContent'));
const PostDetail = lazy(() => import('@features/posts/pages/PostDetail/PostDetail'));
const CreatePost = lazy(() => import('@features/posts/pages/CreatePost/CreatePost'));

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

const subtables = [
    {
        namespace: "CodeTalk 1",
        avatar: {
            src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
        }
    },
    {
        namespace: "CodeTalk 2",
        avatar: {
            src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
        }
    },
    {
        namespace: "CodeTalk 3",
        avatar: {
            src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
        }
    },
    {
        namespace: "CodeTalk 4",
        avatar: {
            src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
        }
    }
];

const mainRoutes = {
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
            path: "createpost",
            element: <CreatePost subtable={subtables}/>,
        }
    ],
}

export default mainRoutes;