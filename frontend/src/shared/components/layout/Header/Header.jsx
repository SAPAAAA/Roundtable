import React from 'react'; // Removed useEffect, useRef, useState
import './Header.css';
import Button from '#shared/components/UIElement/Button/Button';
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Icon from "#shared/components/UIElement/Icon/Icon";
import Link from "#shared/components/Navigation/Link/Link";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import useAuth from "#hooks/useAuth.jsx";
import PopoverMenu from '#shared/components/UIElement/PopoverMenu/PopoverMenu';
import {useNavigate} from "react-router";
import useNotifications from "#hooks/useNotifications.jsx";
import useChat from "#hooks/useChat.jsx";

export default function Header(props) {
    const {toggleSidebar, toggleChat, openLoginModal, openCreateSubtableModal} = props;
    const {user, logout, isLoading} = useAuth();
    const navigate = useNavigate();
    const {unreadCount: notificationUnreadCount} = useNotifications();
    const {totalUnreadMessages: chatUnreadCount} = useChat();


    const handleMenuItemClick = (action) => {
        if (action) {
            action();
        }
        // Removed setShowPopover(false) - PopoverMenu handles closing
    };

    const handleNotificationsClick = () => {
        console.log("Notifications Clicked - Navigating");
        navigate('/notifications'); // Navigate to the notifications route
    };

    const handleLogoutClick = async () => {
        await logout();
        // Removed setShowPopover(false) - PopoverMenu handles closing
    }

    // --- Define the Trigger Element for the Popover ---
    const avatarTrigger = (
        <Button
            dataBsToggle="tooltip" // Keep tooltip on the trigger if desired
            dataBsTrigger="hover focus"
            tooltipTitle="User menu"
            tooltipPlacement="bottom"
            contentType="icon"
            padding="1"
        >
            <Avatar
                src="https://avatars.githubusercontent.com/u/55435868?v=4" // Consider using user.avatarUrl if available
                alt="User"
                width="25"
                height="25"
            />
        </Button>
    );


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
                            onClick={toggleSidebar}
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
                            href="/frontend/public"> {/* Adjust href as needed */}
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
                            <li className="nav-item"><span className="navbar-text">Loading...</span></li>
                        ) : user ?
                            <>
                                <li className="nav-item">
                                    <Button
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Create a new community"
                                        tooltipPlacement="bottom"
                                        onClick={openCreateSubtableModal} // Call the handler
                                        aria-label="Create a new community"
                                    >
                                        <Icon name="plus" size="20px"/>
                                    </Button>
                                </li>
                                {/* Chat Button */}
                                <li className="nav-item">
                                    <Button
                                        aria-current="page"
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Chat"
                                        tooltipPlacement="bottom"
                                        aria-label={`Chat ${chatUnreadCount > 0 ? `(${chatUnreadCount} unread)` : ''}`}
                                        addClass="position-relative"
                                        onClick={toggleChat}
                                    >
                                        <Icon
                                            name="chat"
                                            size="20px"
                                        />
                                        {chatUnreadCount > 0 && (
                                            <span
                                                className="position-absolute end-0 badge rounded-pill bg-danger notification-badge fs-8"
                                            >
                                                                            {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                                                                        </span>
                                        )}
                                    </Button>
                                </li>
                                {/* Notifications Button with Badge */}
                                <li className="nav-item"> {/* No longer needs position-relative here */}
                                    <Button
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Notifications"
                                        tooltipPlacement="bottom"
                                        onClick={handleNotificationsClick}
                                        aria-label={`Notifications ${notificationUnreadCount > 0 ? `(${notificationUnreadCount} unread)` : ''}`}
                                        addClass="position-relative" // Add relative positioning to the button
                                    >
                                        <Icon name="bell" size="20px"/>
                                        {notificationUnreadCount > 0 && (
                                            <span
                                                className="position-absolute end-0 badge rounded-pill bg-danger notification-badge fs-8"
                                            >
                                                                            {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                                                        </span>
                                        )}
                                    </Button>
                                </li>

                                {/* Avatar and Popover */}
                                <li className="nav-item"> {/* Removed position-relative, PopoverMenu handles it */}
                                    <PopoverMenu
                                        addClass="avatar-popover-menu bg-space-cadet rounded-bottom"
                                        trigger={avatarTrigger}
                                        position="bottom-end"
                                    >
                                        {/* User Info Item */}
                                        <Link
                                            href="/frontend/public"
                                            className="avatar-link"
                                        >
                                            <div
                                                className="d-flex flex-row gap-2 align-items-center px-2 py-2"> {/* Added padding */}
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <Avatar
                                                        src="https://avatars.githubusercontent.com/u/55435868?v=4" // Use user.avatarUrl
                                                        alt="User"
                                                        width="25"
                                                        height="25"
                                                    />
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <div className="fw-bold">
                                                        View Profile
                                                    </div>
                                                    <span
                                                        className="text-muted fs-7">
                                                                                    {user?.username &&
                                                                                        <Identifier type="user"
                                                                                                    namespace={user.username}/>}
                                                                                </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Settings Item */}
                                        <Link
                                            href="/"
                                            // Removed isDropdown prop
                                            className="settings-link px-2 py-2"
                                            onClick={() => handleMenuItemClick(() => console.log("Settings clicked"))} // Example action
                                        >
                                            <Icon name="settings" size="18px" addClass="me-2"/> {/* Added margin */}
                                            <span>Settings</span>
                                        </Link>

                                        {/* Logout Item */}
                                        <Link
                                            className="px-2 py-2 logout-link"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogoutClick().then(() => navigate("/"));
                                            }}
                                        >
                                            <Icon name="logout" size="18px" addClass="me-2"/> {/* Added margin */}
                                            <span>Logout</span>
                                        </Link>
                                    </PopoverMenu>
                                </li>
                            </>
                            :
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
                            </li>}
                    </ul>
                </div>
            </nav>
        </header>
    );
}