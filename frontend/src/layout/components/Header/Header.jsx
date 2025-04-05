import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Button from '@shared/components/UIElement/Button/Button';
import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Icon from "@shared/components/UIElement/Icon/Icon.jsx";

export default function Header(props) {
    return (
        <header id="header-container">
            <nav
                className="navbar navbar-expand-lg fixed-top d-flex align-items-center"
                id="header"
            >
                <div className="container-fluid d-flex align-items-center justify-content-between flex-nowrap">

                    {/* Left Side: Toggle + Brand */}
                    <div className="d-flex align-items-center flex-shrink-0 column-gap-2">
                        <Button
                            id="header-left-sidebar-toggle"
                            onClick={props.toggleSidebar}
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Toggle Sidebar"
                            tooltipPlacement="bottom"
                        >
                            <Icon
                                name="menu"
                                size="20px"
                            />
                        </Button>
                        <a
                            className="nav-brand mb-0"
                            id="header-brand"
                            href="#">
                            Navbar
                        </a>
                    </div>

                    {/* Center Search Bar */}
                    <form
                        className="container-fluid d-flex justify-content-center"
                        id="header-search-bar"
                        role="search"
                        style={{ maxWidth: "500px", minWidth: "40%" }}
                    >
                        <input
                            className="form-control w-100 rounded-pill"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                        />
                        <button className="btn btn-outline-light"
                            type="submit"
                            style={{ display: "none" }}
                        >
                            Search
                        </button>
                    </form>

                    {/* Right Nav Items */}
                    <ul className="navbar-nav d-flex flex-row align-items-center column-gap-3 flex-shrink-0">
                        {/* button login/register */}
                        <li className="nav-item">
                            {/* <Link to="/login"> */}
                                <Button
                                    contentType="text"
                                    className="btn-outline-light"
                                >
                                    Login
                                </Button>
                            {/* </Link> */}
                        </li>
                        <li className="nav-item">
                            <Button
                                aria-current="page"
                                contentType="icon"
                                dataBsToggle="tooltip"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Chat"
                                tooltipPlacement="bottom"
                            >
                                <Icon
                                    name="chat"
                                    size="20px"
                                />
                            </Button>
                        </li>
                        <li className="nav-item">
                            <Button
                                contentType="icon"
                                dataBsToggle="tooltip"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Notifications"
                                tooltipPlacement="bottom"
                            >
                                <Icon
                                    name="bell"
                                    size="20px"
                                />
                            </Button>
                        </li>
                        <li className="nav-item">
                            <Button
                                dropdown
                                dataBsToggle="tooltip"
                                dataBsTrigger="hover focus"
                                tooltipTitle="User menu"
                                tooltipPlacement="bottom"
                                contentType="icon"
                                padding="1"
                            >
                                <Avatar
                                    src="https://avatars.githubusercontent.com/u/55435868?v=4"
                                    alt="User"
                                    width="25"
                                    height="25"
                                />
                            </Button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}