import React from "react";
import {Outlet} from "react-router";

import "./Main.css";
import RightSidebar from "../RightSidebar/RightSidebar.jsx";

export default function Main(props) {
    return (
        <div id={props.id} className="d-flex flex-row mx-auto">
            <main className="container-fluid mx-auto">
                <Outlet/>
            </main>
            <RightSidebar id="right-sidebar-container"/>
        </div>
    );
}