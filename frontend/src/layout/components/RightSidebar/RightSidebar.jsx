import React from "react";
import "./RightSidebar.css";

export default function RightSidebar(props) {
    return (
        <div id={props.id}>
            {props.children}
        </div>
    );
}