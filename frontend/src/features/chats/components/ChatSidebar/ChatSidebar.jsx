// Suggested path: src/features/chats/components/ChatAppWrapper/ChatSidebar.jsx
import React from 'react';
import './ChatSidebar.css'; // CSS for the sidebar styling

export default function ChatSidebar({chats, selectedChatId, onSelectChat}) {
    return (
        <div className="chat-sidebar">
            <h5 className="sidebar-header">Chats</h5>
            <ul className="chat-list list-unstyled"> {/* Use list-unstyled from Bootstrap */}
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                        className={`chat-list-item ${chat.id === selectedChatId ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        {chat.partnerName}
                    </li>
                ))}
            </ul>
        </div>
    );
}