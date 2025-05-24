import React from 'react';
import './ChatSidebar.css';
import Icon from "#shared/components/UIElement/Icon/Icon.jsx";
import Button from "#shared/components/UIElement/Button/Button.jsx";

export default function ChatSidebar(props) {
    const {chats, selectedPartnerId, onSelectChat, onAddNewChat} = props;

    return (
        <div
            className="chat-sidebar d-flex flex-column border-end bg-light h-100 flex-shrink-0"> {/* Added Bootstrap classes */}
            <div
                className="sidebar-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom"> {/* Bootstrap classes */}
                <h5 className="fw-bold mb-0 fs-6">Chats</h5> {/* Bootstrap typography */}
                <Button
                    contentType="icon"
                    dataBsToggle="tooltip"
                    dataBsPlacement="bottom" // Bootstrap 5.3 uses data-bs-placement
                    title="New chat" // Bootstrap 5.3 uses title for tooltips
                    onClick={onAddNewChat}
                    addClass="p-1" // Adjust padding with Bootstrap class
                >
                    <Icon name="plus" size="20px"/>
                </Button>
            </div>

            <ul className="chat-list list-group list-group-flush overflow-auto flex-grow-1"> {/* Bootstrap list classes */}
                {chats.map((chat) => (
                    <li
                        key={chat.partnerPrincipalId}
                        className={`chat-list-item list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-2 ${chat.partnerPrincipalId === selectedPartnerId ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat.partnerPrincipalId)}
                        role="button" // Added for accessibility
                    >
                        <span
                            className="chat-user-name text-truncate me-2">{chat.partnerDisplayName}</span> {/* Bootstrap text truncate */}
                        {chat.unreadCount > 0 && (
                            <span className="chat-unread-count badge bg-danger rounded-pill"> {/* Bootstrap badge */}
                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </span>
                        )}
                    </li>
                ))}
                {chats.length === 0 && (
                    <li className="list-group-item text-muted text-center px-1 py-3 small">
                        Không có cuộc trò chuyện nào.
                    </li>
                )}
            </ul>
        </div>
    );
}