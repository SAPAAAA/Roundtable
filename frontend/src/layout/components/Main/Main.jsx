import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import Home from "@pages/Home";

// Function to generate random posts
const generateRandomPosts = (count = 5) => {
    const titles = [
        "What app you can't live without?",
        "Why self-hosting is the future?",
        "Best open-source tools for developers?",
        "How to improve server security?",
        "Is cloud better than self-hosting?",
    ];

    const contents = [
        "I'm always looking for self-hosting services...",
        "Security is a top priority when self-hosting...",
        "These open-source tools have changed my workflow...",
        "Running a secure server requires proper maintenance...",
        "Many argue between cloud and self-hosting advantages...",
    ];

    return Array.from({ length: count }, (_, index) => ({
        subreddit: `r/${["selfhosted", "opensource", "technology", "programming"][Math.floor(Math.random() * 4)]}`,
        time: `${Math.floor(Math.random() * 12) + 1} hr. ago`,
        title: titles[Math.floor(Math.random() * titles.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        upvotes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500),
    }));
};

export default function Main() {
    // const [posts, setPosts] = useState(generateRandomPosts());
    //
    // const onAddPost = (newPost) => {
    //     setPosts((prevPosts) => [newPost, ...prevPosts]);
    // }

    return (
        <main id="main-container"
              className="container-fluid">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={ <Home /> } />
                </Routes>
            </BrowserRouter>
        </main>
    );
}
