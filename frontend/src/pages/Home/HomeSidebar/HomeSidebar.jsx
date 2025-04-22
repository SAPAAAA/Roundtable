import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './HomeSidebar.css';
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import useSidebar from "#hooks/useSidebar.jsx";
import { sendApiRequest } from "#utils/apiClient";

export default function HomeSidebarContent() {
    const { setSidebarParts } = useSidebar();
    const [recentPosts, setRecentPosts] = useState([]);

    const clearSidebarContent = useCallback(() => {
        setSidebarParts({ header: null, body: null });
    }, [setSidebarParts]);

    useEffect(() => {   
        async function fetchRecentPosts() {
            try {
                const data = await sendApiRequest("/api/posts/recent"); //adjust if needed
                setRecentPosts(data);
            } catch (error) {
                console.error("Failed to load recent posts for sidebar:", error);
            }
        }

        fetchRecentPosts();
    }, []);

    const headerContent = useMemo(() => (
        <>
            <h3>Recent Posts</h3>
            <button className="clear-btn" onClick={clearSidebarContent}>
                Clear
            </button>
        </>
    ), [clearSidebarContent]);

    const bodyContent = useMemo(() => (
        <div className="right-sidebar__posts">
            {recentPosts.map((post) => (
                <div className="post-item" key={post.id}>
                    <Identifier type="subtable" namespace={post.subtable} />
                    <div className="post-item__title">{post.title}</div>
                    <div className="post-item__info">
                        <span>{post.upvotes} upvotes</span> •{" "}
                        <span>{post.comments} comments</span>
                    </div>
                </div>
            ))}
        </div>
    ), [recentPosts]);

    useEffect(() => {
        setSidebarParts({
            header: headerContent,
            body: bodyContent,
        });

        return () => {
            setSidebarParts(null);
        };
    }, [setSidebarParts, headerContent, bodyContent]);

    return null;
}
