import commentService from "#services/commentService.jsx";

export default async function commentAction({request}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Get the method from the request
    const method = request.method.toLowerCase();

    if (method === 'post') {
        // Handle the comment submission
        const {content, parentId} = data;

        const subtableName = request.url.split('/')[4];
        const postId = request.url.split('/')[6];

        const response = await commentService.addComment(subtableName, postId, content, parentId);
    }


}