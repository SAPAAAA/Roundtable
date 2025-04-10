import React, {useRef} from "react";

import "./WriteComment.css";

import TextEdit from "@shared/components/UIElement/TextEditor/TextEditor";
import Form from "../../../../shared/components/UIElement/Form/Form";
import Button from "../../../../shared/components/UIElement/Button/Button";
//{ postId,onCancel, onCommentSubmit }
export default function WriteComment(props) {
    const editorRef = useRef();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = editorRef.current.getContent();
        const newComment = {

            postId: props.postId,
            username: props.username,
            src: props.src,
            time: props.time,
            content: content,
            parentId: props.parentId
        }
        if (props.parentId === null) {
            props.setInput(false)
        } else {
            props.setInput(props.setIndex, false)
        }
        localStorage.setItem("comments", JSON.stringify(newComment));
    }

    return(
        <>
            <Form
                onSubmit={handleSubmit}
            >
                <div className="card">
                    <div className="card-body">
                        <TextEdit ref={editorRef}/>
                    </div>
                    <div className="card-footer justify-content-end d-flex ">
                        <Button
                            onClick={props.onCancel}
                            addClass="customCancel me-1"
                            //className="btn btn-sm  customCancel me-1 rounded-pill"
                        >
                            Hủy
                        </Button>
                        <Button
                            //onClick={props.onCommentSubmit}

                            type="submit"
                            addClass="customComment"
                            //className="btn btn-sm customComment rounded-pill"
                        >
                            Bình luận
                        </Button>
                    </div>
                </div>
            </Form>
        </>
    )
}
