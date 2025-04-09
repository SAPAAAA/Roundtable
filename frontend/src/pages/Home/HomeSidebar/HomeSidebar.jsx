import React from 'react';
import './HomeSidebar.css';
import Identifier from "@shared/components/UIElement/Identifier/Identifier";

const posts = [
    {
        id: 1,
        subtable: "vozforums",
        title: "các bác nghĩ sao về việc bạn gái đi chơi về khuya, sau 2h",
        upvotes: 64,
        comments: 125,
    },
    {
        id: 2,
        subtable: "PcBuild",
        title: "The collection is expanding",
        upvotes: 931,
        comments: 55,
    },
    {
        id: 3,
        subtable: "vozforums",
        title:
            "Không rõ mình trả lời phỏng vấn ổn không. Mọi người có đi phỏng vấn chỗ...",
        upvotes: 3,
        comments: 7,
    },
    {
        id: 4,
        subtable: "Genshin_Impact",
        title: "Will you pull for Varesa?",
        upvotes: 8100,
        comments: 1400,
    },
    {
        id: 5,
        subtable: "vozforums",
        title: "Mình cần lời khuyên cho mối quan hệ",
        upvotes: 34,
        comments: 51,
    },
];

const headerContent = (
    <>
        <h3>Recent Posts</h3>
        <button className="clear-btn">Clear</button>
    </>
);

const bodyContent = (
    <>
        <div className="right-sidebar__posts">
            {posts.map((post) => (
                <div className="post-item" key={post.id}>
                    <Identifier
                        type="subtable"
                        namespace={post.subtable}/>
                    <div className="post-item__title">{post.title}</div>
                    <div className="post-item__info">
                        <span>{post.upvotes} upvotes</span> •{" "}
                        <span>{post.comments} comments</span>
                    </div>
                </div>
            ))}
        </div>
    </>
);

const HomeSidebarContent = {
    headerContent,
    bodyContent,
};

export default HomeSidebarContent;