// src/features/chat/components/ChatBox/ChatBox.jsx
import React from 'react';
import './Chatbox.css';
import Button from '#shared/components/UIElement/Button/Button';
import Icon from '#shared/components/UIElement/Icon/Icon';
import ChatMessage from '#features/chats/components/ChatMessage/ChatMessage';

// Modified ChatBox component: Removed onClose prop and button
export default function ChatBox(props) {
    const {chatPartnerName = "Chat", messages = [], onClose} = props;

    const handleCloseChat = () => {
        if (onClose) {
            onClose();
        }
    }

    return (
        <div className={`chatbox-container`}> {/* Removed potential visibility classes */}
            <div className="chatbox-header d-flex justify-content-between align-items-center px-3 py-2">
                <span className="fw-bold">{chatPartnerName}</span>
                {/* Close Button (Positioned via CSS relative to this wrapper) */}
                <Button
                    type="button"
                    className="btn-close wrapper-close-button"
                    aria-label="Close Chat"
                    onClick={handleCloseChat}
                ></Button>
            </div>

            <div className="chatbox-body flex-grow-1 p-3 d-flex flex-column gap-2">
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        sender={msg.sender}
                        text={msg.text}
                        isSent={msg.sender === 'You'}
                    />
                ))}
                {messages.length === 0 && (
                    <p className="text-muted text-center mt-3">No messages yet.</p>
                )}
            </div>

            <div className="chatbox-footer d-flex align-items-center p-2 border-top">
                <input
                    type="text"
                    className="form-control form-control-sm rounded-pill me-2"
                    placeholder="Type a message..."
                    aria-label="Chat message input"
                />
                <Button
                    contentType="icon"
                    ariaLabel="Send message"
                    padding="1"
                    addClass="chatbox-send-btn"
                >
                    <Icon name="share" size="18px"/>
                </Button>
            </div>
        </div>
    );
}