import React, {useEffect, useRef, useState} from 'react';
import './Header.css';
import Button from '@shared/components/UIElement/Button/Button';
import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Icon from "@shared/components/UIElement/Icon/Icon";
import Link from "@shared/components/Navigation/Link/Link";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import {useAuth} from "@contexts/AuthContext.jsx";

export default function Header(props) {
    const {toggleSidebar, openLoginModal} = props;
    const {user, logout, isLoading} = useAuth();

    const [showPopover, setShowPopover] = useState(false);
    const avatarRef = useRef(null);
    const popoverRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target) &&
                avatarRef.current && // Check avatarRef exists
                !avatarRef.current.contains(event.target)
            ) {
                setShowPopover(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []); // Removed popoverRef/avatarRef from deps as they don't change

    const handleMenuItemClick = (action) => {
        if (action) {
            action();
        }
        setShowPopover(false); // Close popover after clicking an item
    };

    const handleLogoutClick = async () => {
        await logout();
        // Maybe close popover if it was open
        setShowPopover(false);
    }

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
                            onClick={toggleSidebar} // Use prop directly
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
                        <Link
                            className="nav-brand mb-0"
                            id="header-brand"
                            href="/frontend/public">
                            Navbar
                        </Link>
                    </div>

                    {/* Center Search Bar */}
                    <form
                        className="container-fluid d-flex justify-content-center"
                        id="header-search-bar"
                        role="search"
                        style={{maxWidth: "500px", minWidth: "40%"}}
                    >
                        <input
                            className="form-control w-100 rounded-pill"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                        />
                        <button className="btn btn-outline-light"
                                type="submit"
                                style={{display: "none"}}
                        >
                            Search
                        </button>
                    </form>

                    {/* Right Nav Items */}
                    <ul className="navbar-nav d-flex flex-row align-items-center column-gap-3 flex-shrink-0">
                        {isLoading ? (
                            <li className="nav-item"><span className="navbar-text">Loading...</span></li> // Show loading indicator
                        ) : !user ? ( // If not loading and no user
                            <li className="nav-item">
                                <Button
                                    contentType="text"
                                    dataBsToggle="tooltip"
                                    dataBsTrigger="hover focus"
                                    tooltipTitle="Login"
                                    tooltipPlacement="bottom"
                                    onClick={openLoginModal}
                                >
                                    Login
                                </Button>
                            </li>
                        ) : (
                            <>
                                {/* Chat Button */}
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
                                {/* Notifications Button */}
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
                                {/* Avatar and Popover */}
                                <li className="nav-item position-relative">
                                    {/* Ref added to the container div */}
                                    <div ref={avatarRef}>
                                        <Button
                                            // Removed dropdown prop if not used by Button styling
                                            dataBsToggle="tooltip"
                                            dataBsTrigger="hover focus"
                                            tooltipTitle="User menu"
                                            tooltipPlacement="bottom"
                                            contentType="icon"
                                            padding="1" // Check if this prop works as intended
                                            onClick={() => setShowPopover((prev) => !prev)}
                                            aria-haspopup="true" // Accessibility
                                            aria-expanded={showPopover} // Accessibility
                                        >
                                            <Avatar
                                                src="https://avatars.githubusercontent.com/u/55435868?v=4"
                                                alt="User"
                                                width="25"
                                                height="25"
                                            />
                                        </Button>
                                    </div>

                                    {showPopover && (
                                        <div
                                            ref={popoverRef}
                                            className="popover-menu card fs-7"
                                        >
                                            <div className="popover-user-info">
                                                <Link
                                                    href="/frontend/public"
                                                    isDropdown>
                                                    <div className="d-flex flex-row gap-2 align-items-center">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center">
                                                            <Avatar
                                                                src="https://avatars.githubusercontent.com/u/55435868?v=4"
                                                                alt="User"
                                                                width="25"
                                                                height="25"
                                                            />
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <div className="fw-bold">
                                                                View Profile
                                                            </div>
                                                            <span className="text-muted fs-7">
                                                        <Identifier type="username" namespace={user.username}/>
                                                    </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <hr className="popover-divider"/>

                                            {/* Menu Items */}
                                            <div className="popover-menu-items">
                                                <Link
                                                    href="/frontend/public"
                                                    isDropdown
                                                    className="popover-menu-item"
                                                    onClick={() => handleMenuItemClick()}
                                                >
                                                    <Icon name="settings" size="18px"/>
                                                    <span>Settings</span>
                                                </Link>
                                            </div>

                                            <hr className="popover-divider"/>

                                            {/* Logout */}
                                            <div>
                                                <Link
                                                    href="/frontend/public"
                                                    isDropdown
                                                    className="popover-menu-item"
                                                    onClick={handleLogoutClick}
                                                >
                                                    <Icon name="logout" size="18px"/>
                                                    <span>Logout</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
}