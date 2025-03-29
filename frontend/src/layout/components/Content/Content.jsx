import React from 'react';

import LeftSidebar from '@layout/components/LeftSidebar/LeftSidebar';
import Main from '@layout/components/Main/Main.jsx';

import './Content.css';

export default function Content(props) {
    return (
        <div className="d-flex flex-row" id="content-container">
            <LeftSidebar
                id="left-sidebar-container"
                toggleSidebar={props.toggleSidebar}
                isSidebarVisible={props.isSidebarVisible}
            />
            <Main id="main-container"/>
        </div>
    );
}