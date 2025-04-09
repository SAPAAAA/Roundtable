import React from 'react';

import LeftSidebar from '@shared/components/layout/LeftSidebar/LeftSidebar';
import Main from "@shared/components/layout/Main/Main";

import './Content.css';

export default function Content(props) {
    return (
        <div className="d-flex flex-row" id="content-container">
            <LeftSidebar
                id="left-sidebar-container"
                toggleSidebar={props.toggleSidebar}
                isSidebarVisible={props.isSidebarVisible}
            />
            <Main
                id="main-container"/>
        </div>
    );
}