import React, {useEffect, useState} from "react";

import HomeSidebarContent from "#pages/Home/HomeSidebar/HomeSidebar.jsx";
import {Helmet} from "react-helmet";
import PostPreview from "#features/posts/components/PostPreview/PostPreview";
import homeService from "#services/homeService";

export default function HomeContent() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await homeService.getHomeData();
                setPosts(data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu bài viết:", error);
                setError("Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Helmet>
                <title>Home</title>
                <meta name="description" content="Welcome to the home page!"/>
            </Helmet>

            <HomeSidebarContent/>

            <div className="posts-container">
                {posts.length > 0 ? (
                    posts.map(post => {
                        const {subtable, author, ...postdetails} = post;

                        return (
                            <PostPreview
                                key={postdetails.postId}
                                post={postdetails}
                                subtable={subtable}
                                isJoined={false}
                                onJoinClick={() => console.log(`Join clicked for ${post.subtable.namespace}`)}
                            />
                        );
                    })
                ) : (
                    <div>Không có bài viết nào.</div>
                )}
            </div>
        </div>
    );
}