import React, {lazy} from 'react';
import getPostRoutesConfig from "./postRoutes.jsx";
import getProfileRoutesConfig from "./profileRoutes.jsx";
import getNotificationRoutesConfig from "./notificationRoutes.jsx";

// Lazy-loaded components for this section
const MainLayout = lazy(() => import('#layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('#pages/Home/HomeContent/HomeContent'));
const CreatePost = lazy(() => import('#features/posts/pages/CreatePost/CreatePost'));

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
        author: {
            username: "John Doe",
            avatar: {
                src: "https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80",
            },
        },
        alt: "Ảnh này bị hư",
        time: "5 min. ago",
        content: "That's a great question! I'd say Python is great for web development.",
        upvotes: 2,
        parentId: null, // Kept for reference, but not strictly needed by the component anymore
        replies: [ // Replies to John Doe (id: 1) are nested here
            {
                id: 2,
                author: {
                    username: "Alice Smith",
                    avatar: {
                        src: "https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80",
                    },
                },
                alt: "Ảnh bị hư",
                time: "3 min. ago",
                content: "I agree! Python is very flexible and easy to learn.",
                upvotes: 5,
                parentId: 1,
                replies: [] // Alice Smith has no replies in this data
            },
            {
                id: 5,
                author: {
                    username: "Michael Brown",
                    avatar: {
                        src: "https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80",
                    },
                },
                alt: "Ảnh bị hư",
                time: "2 min. ago",
                content: "I also love Python! It’s great for data science as well.",
                upvotes: 3,
                parentId: 1,
                replies: [] // Michael Brown has no replies in this data
            }
        ]
    },
    {
        id: 3,
        author: {
            username: "Bob Johnson",
            avatar: {
                src: "https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80",
            },
        },
        alt: "Ảnh bị hư",
        time: "10 min. ago",
        content: "What about JavaScript? I think it's also powerful for web dev.",
        upvotes: 3,
        parentId: null,
        replies: [ // Replies to Bob Johnson (id: 3) are nested here
            {
                id: 4,
                author: {
                    username: "Emily Davis",
                    avatar: {
                        src: "https://images.unsplash.com/photo-1502685104226-e9b8f1c2d3a0?w=100&q=80",
                    },
                },
                alt: "Ảnh bị hư",
                time: "7 min. ago",
                content: "Yes! JavaScript is amazing, especially with React and Node.js.",
                upvotes: 4,
                parentId: 3,
                replies: [] // Emily Davis has no replies in this data
            }
        ]
    }
    // Note: Comments 2, 4, and 5 are no longer top-level items.
    // They are now nested within the `replies` array of their respective parents (1 and 3).
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

function mainRoutes() {
    return {
        element: <MainLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: "createpost",
                element: <CreatePost subtable={subtables}/>,
            },
            ...getPostRoutesConfig(),
            ...getNotificationRoutesConfig(),
            ...getProfileRoutesConfig(),
        ],
    };
}

export default mainRoutes;