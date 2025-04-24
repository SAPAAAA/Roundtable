import commentService from "#services/commentService.jsx";

export default async function commentAction({request}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Get the method from the request
    const method = request.method.toLowerCase();

    if (method === 'post') {
        // Handle the comment submission
        const {content, parentId} = data;

        const postId = request.url.split('/')[4];

        console.log("Comment Action Data:", data);
        console.log("Post ID:", postId);

        const response = await commentService.addComment(postId, content, parentId);

        console.log("Comment Service Response:", response);

        if (!response.success) {
            return {
                status: 400,
                message: "Failed to create comment",
            };
        }

        return {
            status: 201,
            message: "Comment created successfully",
            data: response.data,
        };
    }


}