import React from "react";

import ListPostPreview from "#features/posts/components/ListPostPreview/ListPostPreview";

import HomeSidebarContent from "#pages/Home/HomeSidebar/HomeSidebar.jsx";
import {Helmet} from "react-helmet";

export default function HomeContent() {
    const posts = [
        {
            subtable: {
                namespace: "AskAnything",
                avatar: {
                    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                }
            },
            id: 1,
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
            id: 2,
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
            id: 3,
            time: "3 hr. ago",
            title: "What is the best programming language to learn?",
            content: "I'm new to programming and want to learn a new language...",
            upvotes: 750,
            comments: 150,
        },
    ];

    return (
        <div>
            <Helmet>
                <title>Home</title>
                <meta name="description" content="Welcome to the home page!"/>
            </Helmet>

            <HomeSidebarContent/>

            <ListPostPreview posts={posts}/>
        </div>
    )
}