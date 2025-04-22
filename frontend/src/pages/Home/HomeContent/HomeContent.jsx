import React, { useEffect, useState } from "react";
import HomeSidebarContent from "#pages/Home/HomeSidebar/HomeSidebar.jsx";
import {Helmet} from "react-helmet";
import { sendApiRequest } from "#utils/apiClient";
import { LoadingSpinner } from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';

export default function HomeContent() {
    const [posts, setPosts] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try{
                const data = await sendApiRequest("/api/posts");
                setPosts(data);
            }
            catch(err){
                console.log("Error fetching data: " + err);
            }
            finally{
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    return (
        <div>
            <Helmet>
                <title>Home</title>
                <meta name="description" content="Welcome to the home page!"/>
            </Helmet>

            <HomeSidebarContent/>

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <div>
                    {posts.map(post => (
                        <div key={post.id}>
                            <img
                                src={post.subtable?.avatar?.src}
                                alt={`${post.subtable?.namespace} avatar`}
                                width={40}
                            />
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                            <p>{post.upvotes} upvotes | {post.comments} comments</p>
                            <p>{post.time}</p>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}