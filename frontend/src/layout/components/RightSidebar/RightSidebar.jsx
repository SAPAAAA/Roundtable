import React from "react";

export default function RightSidebar(props) {
    return (
        <div id={props.id}>
            {props.children}
        </div>
    );
}