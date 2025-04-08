import React from "react";

import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";

import "./WriteComment.css";

import TextEdit from "../../../../shared/components/TextEditter/TextEdit";
export default function WriteComment({ state, setState })
{
    return(
        <>
        <form action="" method="post">
           <div className="card">
            <div className="card-body">
                <TextEdit/>
            </div>
            <div className="card-footer justify-content-end d-flex ">
                <button onClick={()=>setState(state => !state)} className="btn btn-sm  customCancel me-1 rounded-pill">
                Hủy
               </button>
               <button type="submit" href="/" className="btn btn-sm customComment rounded-pill">
                Bình luận
               </button>

            </div>
           </div>

        </form>
       
        </>
    )
}
