import React, { useState } from "react";
import "./LeftSidebar.css";
import Button from "../../../shared/components/UIElement/Button/Button.jsx";

export default function LeftSidebar(props) {
    return (
        <aside
            id="left-sidebar-container"
            className={`d-flex flex-row p-3 border-end ${props.isSidebarVisible ? 'open' : ''}`}>
            <div id="left-sidebar" className="me-4">
                <a href="/frontend/public" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <span className="fs-4">Roundtable</span>
                </a>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <a href="#" className="nav-link active" aria-current="page">🏠 Home</a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-dark">🔥 Popular</a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-dark">🌍 All</a>
                    </li>
                </ul>
                <hr />
                <div>
                    <h6 className="text-muted">Your Communities</h6>
                    <ul className="nav flex-column mb-3">
                        <li>
                            <a href="#" className="nav-link text-dark">r/reactjs</a>
                        </li>
                        <li>
                            <a href="#" className="nav-link text-dark">r/webdev</a>
                        </li>
                        <li>
                            <a href="#" className="nav-link text-dark">r/learnprogramming</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="d-flex align-items-start "
                 id="left-sidebar-toggle-container">
                <Button
                    id="sidebar-toggle"
                    type="icon"
                    className="border bg-white"
                    tooltip="Toggle Sidebar"
                    tooltipPlacement="bottom"
                    onClick={props.toggleSidebar}
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="20"
                         height="20"
                         fill="currentColor"
                         className="bi bi-list"
                         viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                    </svg>
                </Button>
            </div>
        </aside>
    );
}