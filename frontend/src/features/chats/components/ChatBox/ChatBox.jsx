// src/features/chat/components/ChatBox/ChatBox.jsx
import React, {useEffect, useRef, useState} from 'react';
import './ChatBox.css';
import Button from '#shared/components/UIElement/Button/Button';
import Icon from '#shared/components/UIElement/Icon/Icon';
import ChatMessage from '#features/chats/components/ChatMessage/ChatMessage';

export default function ChatBox(props) {
    const {
        chatPartnerName = "Trò chuyện",
        messages = [],
        onClose,
        onSendMessage,
        currentUserPrincipalId,
        partnerStatus
    } = props;
    const [inputValue, setInputValue] = useState('');

    const canChat = !(partnerStatus === 'suspended' || partnerStatus === 'banned');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleCloseChat = () => {
        if (onClose) {
            onClose();
        }
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendClick = () => {
        if (inputValue.trim() && onSendMessage && canChat) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    let statusMessage = '';
    if (partnerStatus) {
        if (partnerStatus === 'suspended' || partnerStatus === 'banned') {
            statusMessage = `Người dùng này đang ${partnerStatus === 'suspended' ? 'bị đình chỉ' : 'bị cấm'}. Bạn không thể gửi tin nhắn.`;
        } else if (partnerStatus === 'active') {
            statusMessage = `Tài khoản người dùng đang hoạt động.`; // Translated for "active" account status
        } else {
            // Generic fallback for other statuses (e.g., 'online', 'offline' if they are passed)
            // You might want specific Vietnamese translations for these too if they occur.
            statusMessage = `Trạng thái người dùng: ${partnerStatus}.`; // More generic fallback
        }
    }


    return (
        <div className={`chatbox-container`}>
            <div className="chatbox-header d-flex justify-content-between align-items-center px-3 py-2">
                <span className="fw-bold">{chatPartnerName}</span>
                <Button
                    type="button"
                    contentType="icon"
                    mainClass="btn-close btn-close-white"
                    aria-label="Đóng cuộc trò chuyện"
                    tooltipTitle="Đóng cuộc trò chuyện"
                    tooltipPlacement="bottom"
                    onClick={handleCloseChat}
                />
            </div>

            <div className="chatbox-body flex-grow-1 p-3 d-flex flex-column gap-2">
                {statusMessage && (
                    <div
                        className={`text-center p-2 mb-2 small rounded ${!canChat ? 'bg-danger text-white' : 'bg-info-subtle text-info-emphasis'}`}>
                        {statusMessage}
                    </div>
                )}
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.messageId}
                        senderPrincipalId={msg.senderProfile.principalId}
                        currentUserPrincipalId={currentUserPrincipalId}
                        senderDisplayName={msg.senderProfile.displayName}
                        text={msg.body}
                        isSent={msg.senderProfile.principalId === currentUserPrincipalId}
                    />
                ))}
                {messages.length === 0 && !statusMessage && (
                    <p className="text-muted text-center mt-3">Chưa có tin nhắn nào.</p>
                )}
                {messages.length === 0 && statusMessage && canChat && (
                    <p className="text-muted text-center mt-3">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                )}
                <div ref={messagesEndRef}/>
            </div>

            <div className="chatbox-footer d-flex align-items-center p-2 border-top">
                <input
                    type="text"
                    className="form-control form-control-sm rounded-pill me-2"
                    placeholder={!canChat ? "Không thể gửi tin nhắn" : "Nhập tin nhắn..."}
                    aria-label="Chat message input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={!canChat}
                />
                <Button
                    contentType="icon"
                    mainClass="chatbox-send-btn"
                    onClick={handleSendClick}
                    disabled={!inputValue.trim() || !canChat}
                >
                    <Icon
                        name="send"
                        size="20px"
                    />
                </Button>
            </div>
        </div>
    );
}