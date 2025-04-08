import React from "react";

import "./WriteComment.css";

import TextEdit from "@shared/components/UIElement/TextEditor/TextEditor";

export default function WriteComment({ state, setState })
{
    return(
        <>
            <form
                action=""
                method="post">
                <div className="card">
            <div className="card-body">
                <TextEdit/>
            </div>
            <div className="card-footer justify-content-end d-flex ">
                <button onClick={() => setState(state => !state)}
                        className="btn btn-sm  customCancel me-1 rounded-pill">
                Hủy
                </button>
                <button
                    type="submit"
                    className="btn btn-sm customComment rounded-pill">
                Bình luận
                </button>
            </div>
                </div>
        </form>
        </>
    )
}
