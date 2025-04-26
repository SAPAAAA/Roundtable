import {redirect} from "react-router";

async function postDetailLoader({params}) {
    const {postId} = params;
    if (!postId) {
        console.error("Loader error: postId is missing");
        // Or redirect to an error page or home
        return redirect('/error?message=PostID missing');
    }
    try {
        console.log("Loader: Fetching post details for postId:", postId);
        // Assuming getPostDetails returns the structured data { post, subtable, author, comments }
        const response = await PostService.getPostDetails(postId);
        // Ensure comments is always an array
        if (response.data && !Array.isArray(response.data.comments)) {
            response.data.comments = [];
        }
        return response.data; // Return the data directly
    } catch (err) {
        console.error("Loader error fetching post details:", err);
        // Throwing an error here will allow you to catch it with an errorElement
        // Or return specific error structure if you prefer handling it in the component
        throw new Response("Failed to load post details", {status: err.status || 500});
    }
}

export default postDetailLoader;