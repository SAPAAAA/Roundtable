
import postService from "#services/postService.jsx";
import { redirect } from "react-router";
export default async function action({ request }) {
    
    const formData = await request.formData();
    const content = formData.get("contentEditor");
    console.log("Update Post Action", content);
    // const methodOverride = formData.get("_method");

    // if (methodOverride === "patch") {
       
    // }
     // Basic Validation
     if (!content) {
        return { success: false, message: "content and community selection are required.", status: 400 };
    }
    return {
        success: true,
        message: "Post updated successfully.",
        status: 200
    }
    // try {
    //     console.log("Update Post Action", content);
    //     const response = await postService.updatePost({
    //         body: content, // Assuming API expects 'body' for content
    //     });
    //     if (response.success) {
    //         // Redirect to the newly created post or subtable page
    //         const postId = response.data?.post?.postId; // Adjust based on actual response structure
    //         if (postId) {
    //             // return redirect(`/comments/${postId}`);
    //             return;
    //         } else {
    //             // Redirect to home or subtable page if postId is not available
    //             // return redirect('/');
    //             return;
    //         }
    //     } else {
    //         // Return error from API
    //         return {
    //             success: false,
    //             message: response.message || "Failed to update post.",
    //             status: response.status || 500
    //         };
    //     }
    // }
    // catch (error) {
    //     console.error("Action Error updating post:", error);
    //     return {
    //         success: false,
    //         message: error.data?.message || error.message || "An unexpected error occurred.",
    //         status: error.status || 500
    //     };
    // }

}