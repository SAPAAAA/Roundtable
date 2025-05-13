// src/services/ProfileService.js
import { sendApiRequest } from "#utils/apiClient";

class ProfileService {
    async getUserProfileByUserId(userId) {
            const baseUrl = `/api/profile/${userId}`;
            
            const response = await sendApiRequest(baseUrl, {
                method: 'GET'
            });
            
            console.log("profile info", response);
            
            if (!response.success) {
                throw new Error(`Failed to fetch user profile: ${response.message}`);
            }
            
            return response.data;
    }

    async getPostsByUserId(userId, options = {}) {
        const baseUrl = `/api/profile/${userId}`;
        
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        console.log("post list", response);
        
        if (!response.success) {
            throw new Error(`Failed to fetch user posts: ${response.message}`);
        }
        
        // Access the posts array from the nested data structure
        const posts = response.data.posts || [];
        
        // Return the array directly since it's already in the correct format
        return posts;
        // Transform the data to match the expected format
        // return response.data.map(post => ({
        //     post: {
        //         postId: post.postId,
        //         title: post.title,
        //         content: post.content,
        //         createdAt: post.createdAt,
        //         upvotes: post.upvotes,
        //         time: post.createdAt
        //     },
        //     subtable: {
        //         subtableId: post.subtableId,
        //         name: post.subtableName,
        //         icon: post.subtableIcon
        //     }
        // }));
    }

    async getSavedPostsByUserId(userId, options = {}) {
        // Dữ liệu giả mô phỏng giống database thực tế
        const mockData = [
            {
                postId: "00000000-0000-0000-0000-000000000051",
                title: "Welcome to AskAnything",
                body: "Feel free to ask any questions here.",
                createdAt: "2025-05-05T03:38:11+07:00",
                upvotes: 12,
                subtable: {
                    subtableId: "00000000-0000-0000-0000-000000000041",
                    name: "AskAnything",
                    icon: "https://picsum.photos/50"
                }
            },
            {
                postId: "00000000-0000-0000-0000-000000000052",
                title: "Another post by user",
                body: "This is another example post for testing.",
                createdAt: "2025-05-06T10:00:00+07:00",
                upvotes: 7,
                subtable: {
                    subtableId: "00000000-0000-0000-0000-000000000042",
                    name: "TestSubtable",
                    icon: "https://picsum.photos/51"
                }
            }
        ];

        // Nếu muốn lọc theo userId, bạn có thể làm như sau (ở đây dữ liệu giả nên luôn trả về)
        // const userPosts = mockData.filter(post => post.authorUserId === userId);

        // Chuẩn hóa cho ListPostPreviewSubtable nếu cần
        return mockData.map(post => ({
            post: {
                postId: post.postId,
                title: post.title,
                content: post.body,
                createdAt: post.createdAt,
                upvotes: post.upvotes,
                time: post.createdAt
            },
            subtable: post.subtable
        }));
    }

    async getHiddenPostsByUserId(userId, options = {}) {
        // Dữ liệu giả mô phỏng giống database thực tế
        const mockData = [
            {
                postId: "00000000-0000-0000-0000-000000000051",
                title: "Welcome to AskAnything",
                body: "Feel free to ask any questions here.",
                createdAt: "2025-05-05T03:38:11+07:00",
                upvotes: 12,
                subtable: {
                    subtableId: "00000000-0000-0000-0000-000000000041",
                    name: "AskAnything",
                    icon: "https://picsum.photos/50"
                }
            },
            {
                postId: "00000000-0000-0000-0000-000000000052",
                title: "Another post by user",
                body: "This is another example post for testing.",
                createdAt: "2025-05-06T10:00:00+07:00",
                upvotes: 7,
                subtable: {
                    subtableId: "00000000-0000-0000-0000-000000000042",
                    name: "TestSubtable",
                    icon: "https://picsum.photos/51"
                }
            }
        ];

        // Nếu muốn lọc theo userId, bạn có thể làm như sau (ở đây dữ liệu giả nên luôn trả về)
        // const userPosts = mockData.filter(post => post.authorUserId === userId);

        // Chuẩn hóa cho ListPostPreviewSubtable nếu cần
        return mockData.map(post => ({
            post: {
                postId: post.postId,
                title: post.title,
                content: post.body,
                createdAt: post.createdAt,
                upvotes: post.upvotes,
                time: post.createdAt
            },
            subtable: post.subtable
        }));
    }

    async getCommentsByUserId(userId) {
        const baseUrl = `/api/profile/${userId}`;
        
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        
        console.log("[ProfileService] Comments response:", response);
        
        if (!response.success) {
            throw new Error(`Failed to fetch user comments: ${response.message}`);
        }
        
        // Access the comments array from the nested data structure
        const comments = response.data.comments || [];
        
        return comments.map(comment => ({
            commentId: comment.commentId,
            postId: comment.postId,
            authorUserId: comment.authorUserId,
            author: {
                avatar: comment.authorAvatar || "https://picsum.photos/40",
                displayName: comment.authorDisplayName,
                username: comment.authorUsername
            },
            body: comment.body,
            commentCreatedAt: comment.createdAt,
            voteCount: comment.voteCount || 0,
            userVote: null,
            parentCommentId: comment.parentCommentId,
            isRemoved: comment.isRemoved || false,
            replies: comment.replies || []
        }));
    }
    
    async getUpvotedPosts(userId) {
        const baseUrl = `/api/profile/${userId}`;
        
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        if (!response.success) {
            throw new Error(`Failed to fetch upvoted posts: ${response.message}`);
        }
        
        return response.data.upvotedPosts || [];
    }

    async getUpvotedComments(userId) {
        const baseUrl = `/api/profile/${userId}`;
        
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        if (!response.success) {
            throw new Error(`Failed to fetch upvoted comments: ${response.message}`);
        }
        
        return response.data.upvotedComments || [];
    }

    async getDownvotedPosts(userId) {
        const baseUrl = `/api/profile/${userId}`;
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        if (!response.success) {
            throw new Error(`Failed to fetch downvoted posts: ${response.message}`);
        }
        return response.data.downvotedPosts || [];
    }

    async getDownvotedComments(userId) {
        const baseUrl = `/api/profile/${userId}`;
        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });
        if (!response.success) {
            throw new Error(`Failed to fetch downvoted comments: ${response.message}`);
        }
        return response.data.downvotedComments || [];
    }
}

export default new ProfileService();
