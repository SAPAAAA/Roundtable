import React from "react";

import ListPostPreview from "@features/posts/components/ListPostPreview/ListPostPreview";

// export default function PostPreview(props) {
//     return (
//         <div className="card p-3 my-3">
//             {/* Subreddit Info */}
//             <div className="d-flex align-items-center mb-2">
//                 <span className="text-muted">{props.post.subreddit} • {props.post.time}</span>
//             </div>
//
//             {/* Post Title */}
//             <h5 className="fw-bold">{props.post.title}</h5>
//
//             {/* Post Content */}
//             <p>{props.post.content}</p>
//
//             {/* Post Actions */}
//             <div className="d-flex align-items-center">
//                 <button className="btn btn-outline-light me-2">
//                     <i className="bi bi-arrow-up"></i> {props.post.upvotes}
//                 </button>
//                 <button className="btn btn-outline-light me-2">
//                     <i className="bi bi-arrow-down"></i>
//                 </button>
//                 <button className="btn btn-outline-light me-2">
//                     <i className="bi bi-chat-left"></i> {props.post.comments}
//                 </button>
//                 <button className="btn btn-outline-light">
//                     <i className="bi bi-share"></i> Share
//                 </button>
//             </div>
//         </div>
//     );
// }

export default function Home() {
    const posts = [
        {
            subtable: {
                namespace: "AskAnything",
                avatar: {
                    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                }
            },
            time: "1 hr. ago",
            title: "What is the most interesting fact you know?",
            content: "I'm curious to know what interesting facts you all know...",
            upvotes: 500,
            comments: 100,
        },
        {
            subtable: {
                namespace: "CoolTech",
                avatar: {
                    src: "https://images.unsplash.com/photo-1581091012184-7e0cdfbb6791?w=100&q=80"
                }
            },
            time: "2 hr. ago",
            title: "What is the best tech stack for web development?",
            content: "I'm looking to start a new project and need some advice...",
            upvotes: 1000,
            comments: 200,
        },
        {
            subtable: {
                namespace: "CodeTalk",
                avatar: {
                    src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
                }
            },
            time: "3 hr. ago",
            title: "What is the best programming language to learn?",
            content: "I'm new to programming and want to learn a new language...",
            upvotes: 750,
            comments: 150,
        },
    ];

    return (
        <div>
            <ListPostPreview posts={posts}/>
        </div>
    );
}