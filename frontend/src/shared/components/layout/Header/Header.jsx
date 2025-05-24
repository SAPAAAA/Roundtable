import React, {useState} from 'react';
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
import useChat from "#hooks/useChat.jsx"; // Import useChat to get chat-related states/functions

export default function Header(props) {
    // toggleChat is now toggleChatVisibility from ChatContext, openChatWithUser is also from ChatContext
    const {toggleSidebar, openLoginModal, openCreateSubtableModal, toggleChat, openChatWithUser} = props;
    const {user, logout, isLoading} = useAuth();
    const navigate = useNavigate();
    const {unreadCount: notificationUnreadCount} = useNotifications();
    const {totalUnreadMessages: chatUnreadCount, conversationPartners} = useChat(); // Get conversationPartners
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenuItemClick = (action) => {
        if (action) {
            action();
        }
    };

    const handleNotificationsClick = () => {
        navigate('/notifications');
    };

    const handleLogoutClick = async () => {
        await logout();
        navigate("/");
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const handleChatIconClick = () => {
        // If there's only one unread conversation, open it directly
        // This is an enhanced behavior, original request was to replace toggleChat
        const unreadConversations = conversationPartners.filter(p => p.unreadCount > 0);
        if (chatUnreadCount > 0 && unreadConversations.length === 1) {
            openChatWithUser(unreadConversations[0].partnerPrincipalId);
        } else {
            toggleChat(); // This is toggleChatVisibility from context
        }
    };

    const avatarTrigger = (
        <Button
            dataBsToggle="tooltip"
            dataBsTrigger="hover focus"
            tooltipTitle="User menu"
            tooltipPlacement="bottom"
            contentType="icon"
            padding="1"
        >
            <Avatar
                src={user?.avatar || "https://avatars.githubusercontent.com/u/55435868?v=4"}
                alt={user?.displayName || "User"}
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
                            href="/">
                            Roundtable
                        </Link>
                    </div>

                    <form
                        id="header-search-bar"
                        role="search"
                        style={{maxWidth: "500px", minWidth: "40%"}}
                        onSubmit={handleSearchSubmit}
                        className="d-flex"
                    >
                        <input
                            className="form-control w-100 rounded-pill"
                            type="search"
                            placeholder="Tìm kiếm..."
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <ul className="navbar-nav d-flex flex-row align-items-center column-gap-3 flex-shrink-0">
                        {isLoading ? (
                            <li className="nav-item"><span className="navbar-text">Loading...</span></li>
                        ) : user ? (
                            <>
                                <li className="nav-item">
                                    <Button
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Create a new community"
                                        tooltipPlacement="bottom"
                                        onClick={openCreateSubtableModal}
                                        aria-label="Create a new community"
                                    >
                                        <Icon name="plus" size="20px"/>
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <Button
                                        aria-current="page"
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Tin nhắn"
                                        tooltipPlacement="bottom"
                                        aria-label={`${chatUnreadCount > 0 ? `(${chatUnreadCount} tin nhắn chưa đọc)` : ''}`}
                                        addClass="position-relative"
                                        onClick={handleChatIconClick} // Updated onClick handler
                                    >
                                        <Icon name="chat" size="20px"/>
                                        {chatUnreadCount > 0 && (
                                            <span
                                                className="position-absolute end-0 badge rounded-pill bg-danger notification-badge fs-8">
                                                {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <Button
                                        contentType="icon"
                                        dataBsToggle="tooltip"
                                        dataBsTrigger="hover focus"
                                        tooltipTitle="Thông báo"
                                        tooltipPlacement="bottom"
                                        onClick={handleNotificationsClick}
                                        aria-label={`${notificationUnreadCount > 0 ? `(${notificationUnreadCount} thông báo chưa đọc)` : ''}`}
                                        addClass="position-relative"
                                    >
                                        <Icon name="bell" size="20px"/>
                                        {notificationUnreadCount > 0 && (
                                            <span
                                                className="position-absolute end-0 badge rounded-pill bg-danger notification-badge fs-8">
                                                {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <PopoverMenu
                                        addClass="avatar-popover-menu bg-space-cadet rounded-bottom"
                                        trigger={avatarTrigger}
                                        position="bottom-end"
                                    >
                                        <Link href={`/user/${user.username}`}
                                              className="avatar-link">
                                            <div className="d-flex flex-row gap-2 align-items-center px-2 py-2">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <Avatar
                                                        src={user?.avatarUrl || "https://avatars.githubusercontent.com/u/55435868?v=4"}
                                                        alt={user?.displayName || "User"}
                                                        width="25"
                                                        height="25"
                                                    />
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <div className="fw-bold">View Profile</div>
                                                    <span className="text-muted fs-7">
                                                        {user?.username &&
                                                            <Identifier type="user" namespace={user.username}/>}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                        <Link href="/" className="settings-link px-2 py-2"
                                              onClick={() => handleMenuItemClick(() => console.log("Settings clicked"))}>
                                            <Icon name="settings" size="18px" addClass="me-2"/>
                                            <span>Cài đặt</span>
                                        </Link>
                                        <Link
                                            href="#"
                                            className="px-2 py-2 logout-link"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogoutClick();
                                            }}
                                        >
                                            <Icon name="box_arrow_right" size="18px" addClass="me-2"/>
                                            <span>Đăng xuất</span>
                                        </Link>
                                    </PopoverMenu>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Button
                                    contentType="text"
                                    dataBsToggle="tooltip"
                                    dataBsTrigger="hover focus"
                                    tooltipTitle="Đăng nhập"
                                    tooltipPlacement="bottom"
                                    onClick={openLoginModal}
                                >
                                    Đăng nhập
                                </Button>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
}