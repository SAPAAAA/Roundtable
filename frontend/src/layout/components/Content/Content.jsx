import React, {useState} from 'react';

import LeftSidebar from '@layout/components/LeftSidebar/LeftSidebar';
import Main from '@layout/components/Main/Main.jsx';
import Header from '@layout/components/Header/Header.jsx';

import './Content.css';

export default function Content() {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setSidebarVisible(prev => !prev);
    };

    return (
        <div>
            <Header toggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible}/>
            <div className="d-flex flex-row" id="content-container">
                <LeftSidebar
                    id="left-sidebar-container"
                    toggleSidebar={toggleSidebar}
                    isSidebarVisible={isSidebarVisible}
                />
                <Main id="main-container"/>
            </div>
        </div>
    );
}