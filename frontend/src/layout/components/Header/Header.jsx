import React from 'react';
import './Header.css';
import Button from '@shared/components/UIElement/Button/Button';

export default function Header(props) {
    return (
        <header>
            <nav
                className="navbar navbar-expand-lg bg-primary fixed-top d-flex align-items-center"
                data-bs-theme="dark"
            >
                <div className="container-fluid d-flex align-items-center justify-content-between flex-nowrap">

                    {/* Left Side: Toggle + Brand */}
                    <div className="d-flex align-items-center flex-shrink-0 column-gap-2">
                        <Button
                            id="header-left-sidebar-toggle"
                            onClick={props.toggleSidebar}
                            contentType="icon"
                            tooltip="Toggle Sidebar"
                            tooltipPlacement="bottom"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-list"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                                />
                            </svg>
                        </Button>
                        <a className="navbar-brand mb-0 h1" href="#">
                            Navbar
                        </a>
                    </div>

                    {/* Center Search Bar */}
                    <form
                        className="d-flex justify-content-center"
                        id="header-search-bar"
                        role="search"
                        style={{ maxWidth: '600px' }}
                    >
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                        />
                        <button className="btn btn-outline-light" type="submit">
                            Search
                        </button>
                    </form>

                    {/* Right Nav Items */}
                    <ul className="navbar-nav d-flex flex-row align-items-center column-gap-3 mb-0 ps-3 flex-shrink-0">
                        <li className="nav-item">
                            <Button
                                className=""
                                aria-current="page"
                                contentType="icon"
                                tooltip="Chat"
                                tooltipPlacement="bottom"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     width="20"
                                     height="20"
                                     fill="currentColor"
                                     className="bi bi-chat-left-dots" viewBox="0 0 16 16">
                                    <path
                                        d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                    <path
                                        d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                </svg>
                            </Button>
                        </li>
                        <li className="nav-item">
                            <Button
                                className=""
                                contentType="icon"
                                tooltip="Notifications"
                                tooltipPlacement="bottom"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     width="20"
                                     height="20"
                                     fill="currentColor"
                                     className="bi bi-bell"
                                     viewBox="0 0 16 16">
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                                </svg>
                            </Button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
