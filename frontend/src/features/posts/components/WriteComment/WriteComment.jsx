import React, {useRef} from "react";
import $ from 'jquery';
import "./WriteComment.css";
import TextEdit from "#shared/components/UIElement/TextEditor/TextEditor";
import Form from "#shared/components/UIElement/Form/Form";
import Button from "#shared/components/UIElement/Button/Button";

// Accepts onCommentSubmit function prop
export default function WriteComment(props) {
    const {
        postId,
        parentId, // ID of the comment being replied to (null for top-level)
        onCancel,
        onReset,
        onCommentSubmit // Callback function to handle submission
    } = props;

    const editorRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editorRef.current) return; // Guard clause

        const content = editorRef.current.getContent(); // Get raw HTML
        console.log("Raw comment content:", content);

        const textContent = editorRef.current ? $(`<div>${content}</div>`).text().trim() : '';

        console.log("Text content of comment:", textContent);
        if (!textContent) {
            console.log("Comment content is effectively empty (based on text).");
            return;
        }

        // Prepare the data payload for submission
        const newCommentData = {
            postId: postId,
            content: content,
            parentId: parentId
        };

        if (onCommentSubmit) {
            try {
                await onCommentSubmit(newCommentData);
                if (editorRef.current) {
                    editorRef.current.clearContent(); // Clear the editor after submission
                }
            } catch (error) {
                console.error("Error submitting comment:", error);
                // Handle submission error (e.g., show message)
            }
        } else {
            console.warn("WriteComment: onCommentSubmit prop is missing!");
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <div className="card write-comment-card"> {/* Added class for potential styling */}
                    <div className="card-body p-2"> {/* Reduced padding */}
                        {/* Make sure TextEdit is properly controlled or provides content via ref */}
                        <TextEdit ref={editorRef} placeholder="Nhập bình luận của bạn..." name="content"/>
                    </div>
                    <div className="card-footer justify-content-end d-flex p-2"> {/* Reduced padding */}
                        <Button
                            onClick={onCancel}
                            mainClass="write-comment-button"
                            addClass="cancel-button"
                            type="button"
                        >
                            Hủy
                        </Button>
                        &nbsp;
                        <Button
                            onClick={onReset}
                            mainClass="write-comment-button"
                            addClass="reset-button"
                            type="button"
                        >
                            Xóa
                        </Button>
                        &nbsp;
                        <Button
                            type="submit"
                            mainClass="write-comment-button"
                            addClass="submit-button"
                        >
                            Gửi
                        </Button>
                    </div>
                </div>
            </Form>
        </>
    );
}