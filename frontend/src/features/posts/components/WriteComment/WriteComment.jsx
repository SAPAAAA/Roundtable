import React from "react";

import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";

import "./WriteComment.css";


export default function WriteComment({ state, setState })
{
    // const {
    //     state,
    // } = props;
    return(
        <>
        <form action="" method="post">
           <div className="card">
            <div className="card-body">

            </div>
            <div className="card-footer justify-content-end d-flex ">
                <button onClick={()=>setState(write => !write)} className="btn btn-sm  customCancel me-1 rounded-pill">
                Hủy
               </button>
               <button type="submit" className="btn btn-sm customComment rounded-pill">
                Bình luận
               </button>

            </div>
           </div>

        </form>
       
        </>
    )
}
