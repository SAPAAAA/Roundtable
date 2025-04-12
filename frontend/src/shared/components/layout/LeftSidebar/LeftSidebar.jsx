import React, {useState} from "react";
import "./LeftSidebar.css";
import Button from "@shared/components/UIElement/Button/Button.jsx";
import Icon from "@shared/components/UIElement/Icon/Icon.jsx";
import Identifier from '@shared/components/UIElement/Identifier/Identifier';

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
                        <span className="fs-4">&nbsp;Roundtable</span>
                    </a>
                    <hr/>
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item">
                            <a href="#" className="nav-link active d-flex align-items-center">
                                <Icon name="home" size="16" className="me-2"/>&nbsp;Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link text-dark d-flex align-items-center">
                                <Icon name="fire" size="16" className="me-2"/>&nbsp;Popular
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link text-dark d-flex align-items-center">
                                <Icon name="globe" size="16" className="me-2"/>&nbsp;All
                            </a>
                        </li>
                    </ul>
                    <hr/>

                    {/* Communities dropdown section */}
                    <div className="dropdown-section mb-3">
                        <div
                            className="d-flex justify-content-between align-items-center text-muted mb-2 section-header"
                            onClick={toggleCommunities}
                        >
                            <h6 className="text-muted mb-0">&nbsp;COMMUNITIES</h6>
                            <Icon name={communitiesExpanded ? "chevron-up" : "chevron-down"} size="16px"/>
                        </div>

                        {communitiesExpanded && (
                            <ul className="nav flex-column mb-3">
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="community" size="16" className="me-2"/>&nbsp;Communities
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="chart" size="16" className="me-2"/>&nbsp;Best of Reddit
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="topic" size="16" className="me-2"/>&nbsp;Topics
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
                            <h6 className="text-muted mb-0">&nbsp;RECENT</h6>
                            <Icon name={RecentExpanded ? "chevron-up" : "chevron-down"} size="16px" />
                        </div>
                        {RecentExpanded && (
                            <ul className="nav flex-column mb-3 recent-section">
                                <li className="d-flex align-items-center recent-item">
                                    <span className="icon-wrapper"/> {/* empty span for alignment */}
                                    <Identifier
                                        type="subtable"
                                        href="#"
                                        className="nav-link text-dark flex-grow-1"
                                        namespace="reactjs"
                                    />
                                </li>

                                <li className="d-flex align-items-center recent-item">
                                    <span className="icon-wrapper"/> {/* empty span for alignment */}
                                    <Identifier
                                        type="subtable"
                                        href="#"
                                        className="nav-link text-dark flex-grow-1"
                                        namespace="webdev"
                                    />
                                </li>

                                <li className="d-flex align-items-center recent-item">
                                    <span className="icon-wrapper"/> {/* empty span for alignment */}
                                    <Identifier
                                        type="subtable"
                                        href="#"
                                        className="nav-link text-dark flex-grow-1"
                                        namespace="KitDev"
                                    />
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
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="info" size="16" className="me-2"/>&nbsp;About Roundtable
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="megaphone" size="16" className="me-2"/>&nbsp;Advertise
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="chart-up" size="16" className="me-2"/>&nbsp;Reddit&nbsp;Pro
                                        <span className="beta-tag ms-1">BETA</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="question" size="16" className="me-2"/>&nbsp;Help
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="pencil" size="16" className="me-2"/>&nbsp;Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="briefcase" size="16" className="me-2"/>&nbsp;Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="nav-link text-dark d-flex align-items-center">
                                        <Icon name="newspaper" size="16" className="me-2"/>&nbsp;Press
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