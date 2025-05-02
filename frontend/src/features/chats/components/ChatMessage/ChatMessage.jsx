// src/features/chat/components/ChatMessage/ChatMessage.jsx
import React from 'react';
// Import the new specific CSS file
import './ChatMessage.css';

/**
 * Renders a single chat message bubble.
 * @param {object} props
 * @param {string} props.sender - The name of the message sender.
 * @param {string} props.text - The content of the message.
 * @param {boolean} props.isSent - True if the message was sent by the current user, false otherwise.
 */
export default function ChatMessage({sender, text, isSent}) {
    const messageClass = isSent
        ? 'chatbox-message sent align-self-end' // Bootstrap handles alignment
        : 'chatbox-message received align-self-start'; // Bootstrap handles alignment

    return (
        <div className={messageClass}>
            {!isSent && (
                <span className="message-sender fw-bold">{sender}</span> // Bootstrap handles font-weight
            )}
            <p className="message-text m-0">{text}</p> {/* Bootstrap handles margin */}
        </div>
    );
}