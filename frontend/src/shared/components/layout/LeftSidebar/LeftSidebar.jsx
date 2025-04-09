import React, {useState} from "react";
import "./LeftSidebar.css";
import Button from "@shared/components/UIElement/Button/Button.jsx";
import Icon from "@shared/components/UIElement/Icon/Icon.jsx";

export default function LeftSidebar(props) {
    const [resourcesExpanded, setResourcesExpanded] = useState(true);
    const [communitiesExpanded, setCommunitiesExpanded] = useState(false);
    const [RecentExpanded, setRecentExpanded] = useState(false);

    const toggleResources = () => {
        setResourcesExpanded(!resourcesExpanded);
    };

    const toggleCommunities = () => {
        setCommunitiesExpanded(!communitiesExpanded);
    };

    const toggleRecent = () => {
        setRecentExpanded(!RecentExpanded);
    }

    // Add a class for easier CSS targeting and positioning context
    const containerClasses = `border-end p-3 ${props.isSidebarVisible ? 'open' : ''}`;

    return (
        <div
            id={props.id} // Assuming props.id targets this container, e.g., "left-sidebar-container"
            className={containerClasses} // Added position-relative here
        >
            {/* Sidebar Content Area */}
            <aside
                id='left-sidebar-content'
                className='d-flex flex-row' // No longer needed for button positioning
            >
                {/* Removed me-4 as button is no longer next to it */}
                <div id="left-sidebar">
                    <a
                        href="/frontend/public"
                        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                        <span className="fs-4">Roundtable</span>
                    </a>
                    <hr/>
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
                    <hr/>

                    {/* Communities dropdown section */}
                    <div className="dropdown-section mb-3">
                        <div
                            className="d-flex justify-content-between align-items-center text-muted mb-2 section-header"
                            onClick={toggleCommunities}
                        >
                            <h6 className="text-muted mb-0">COMMUNITIES</h6>
                            <Icon name={communitiesExpanded ? "chevron-down" : "chevron-up"} size="16px" />
                        </div>

                        {communitiesExpanded && (
                            <ul className="nav flex-column mb-3">
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">⭕</span> Communities
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">📊</span> Best of Reddit
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">💬</span> Topics
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Recent section */}
                    <div className="dropdown-section">
                        <div
                            className="d-flex justify-content-between align-items-center text-muted mb-2 section-header"
                            onClick={toggleRecent}
                        >
                            <h6 className="text-muted mb-0">RECENT</h6>
                            <Icon name={RecentExpanded ? "chevron-up" : "chevron-down"} size="16px" />
                        </div>
                        {RecentExpanded && (
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
                        )}
                    </div>

                    {/* Resources dropdown section */}
                    <div className="dropdown-section">
                        <div
                            className="d-flex justify-content-between align-items-center text-muted mb-2 section-header"
                            onClick={toggleResources}
                        >
                            <h6 className="text-muted mb-0">RESOURCES</h6>
                            <Icon name={resourcesExpanded ? "chevron-up" : "chevron-down"} size="16px" />
                        </div>

                        {resourcesExpanded && (
                            <ul className="nav flex-column mb-3">
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">ℹ️</span> About Reddit
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">📢</span> Advertise
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">📈</span> Reddit Pro
                                        <span className="beta-tag ms-1">BETA</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">❓</span> Help
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">📝</span> Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">💼</span> Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark">
                                        <span className="icon-wrapper">📰</span> Press
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                <div
                    className="d-flex align-items-start "
                    id="left-sidebar-toggle-container">
                    <Button
                        id="sidebar-toggle"
                        addClass="bg-white"
                        contentType="icon"
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Toggle Sidebar"
                        tooltipPlacement="bottom"
                        onClick={props.toggleSidebar}
                    >
                        <Icon
                            id="sidebar-toggle-icon"
                            name="menu"
                            size="20px"
                        />
                    </Button>
                </div>
            </aside>
        </div>
    );
}