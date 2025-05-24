import React, {useEffect, useRef, useState} from 'react';
import ChatSidebar from '#features/chats/components/ChatSidebar/ChatSidebar';
import ChatBox from '#features/chats/components/ChatBox/ChatBox';
import UserSearchBox from '#features/chats/components/UserSearchBox/UserSearchBox';
import useChat from '#hooks/useChat.jsx';
import Button from '#shared/components/UIElement/Button/Button';
import Icon from '#shared/components/UIElement/Icon/Icon';
import LoadingSpinner from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';
import './ChatAppWrapper.css';
import useAuth from "#hooks/useAuth.jsx";

export default function ChatAppWrapper(props) {
    const {isOpen = false, toggleChatVisibility} = props;
    const {user} = useAuth();

    const {
        conversationPartners,
        messages,
        activePartnerId,
        setActivePartnerId,
        isLoadingMessages,
        sendMessage,
        readMessages,
    } = useChat();

    const [isUserSearchBoxOpen, setIsUserSearchBoxOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const wrapperElement = wrapperRef.current;
        const handleFocusIn = () => {
            if (wrapperElement && isOpen && activePartnerId && !isUserSearchBoxOpen) {
                readMessages(activePartnerId);
            }
        };
        if (wrapperElement) {
            wrapperElement.addEventListener('focusin', handleFocusIn);
        }
        return () => {
            if (wrapperElement) {
                wrapperElement.removeEventListener('focusin', handleFocusIn);
            }
        };
    }, [isOpen, activePartnerId, readMessages, isUserSearchBoxOpen]);

    const handleSendMessage = async (messageBody) => {
        if (!activePartnerId || !messageBody.trim() || isUserSearchBoxOpen) {
            return;
        }
        try {
            await sendMessage(activePartnerId, messageBody);
        } catch (error) {
            alert("Lỗi gửi tin nhắn. Vui lòng thử lại.");
        }
    };

    const handleOpenUserSearchBox = () => {
        setIsUserSearchBoxOpen(true);
    };

    const handleCloseUserSearchBox = () => {
        setIsUserSearchBoxOpen(false);
    };

    const handleUserSelected = (selectedUserFromSearch) => {
        if (setActivePartnerId) {
            setActivePartnerId(selectedUserFromSearch.principalId || selectedUserFromSearch.userId, selectedUserFromSearch);
        }
        setIsUserSearchBoxOpen(false);
    };

    const selectedPartner = conversationPartners.find(p => p.partnerPrincipalId === activePartnerId);
    const messagesForSelectedChat = activePartnerId ? (messages[activePartnerId] || []) : [];
    const wrapperDynamicClasses = isOpen ? 'visible' : '';

    return (
        <div
            className={`chat-app-wrapper position-fixed bottom-0 end-0 m-3 shadow-sm border rounded bg-light d-flex flex-row ${wrapperDynamicClasses}`}
            style={{width: '550px', height: '450px', maxWidth: '90vw', maxHeight: '70vh'}}
            ref={wrapperRef}
            tabIndex="-1"
        >
            <ChatSidebar
                chats={conversationPartners}
                selectedPartnerId={activePartnerId}
                onSelectChat={setActivePartnerId}
                onAddNewChat={handleOpenUserSearchBox}
            />

            <div className="chat-content-area d-flex flex-column flex-grow-1">
                {isUserSearchBoxOpen ? (
                    <UserSearchBox
                        isOpen={isUserSearchBoxOpen}
                        onClose={handleCloseUserSearchBox}
                        onUserSelected={handleUserSelected}
                    />
                ) : activePartnerId ? (
                    isLoadingMessages ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <LoadingSpinner size={40} message="Đang tải tin nhắn..."/>
                        </div>
                    ) : (
                        <ChatBox
                            chatPartnerName={selectedPartner?.partnerDisplayName || "Trò chuyện"}
                            messages={messagesForSelectedChat}
                            onSendMessage={handleSendMessage}
                            onClose={toggleChatVisibility}
                            currentUserPrincipalId={user?.principalId}
                            partnerStatus={selectedPartner?.partnerStatus}
                        />
                    )
                ) : (
                    <div
                        className="no-chat-selected-placeholder p-3 d-flex flex-column justify-content-center align-items-center h-100">
                        <Button
                            type="button"
                            onClick={toggleChatVisibility}
                            mainClass="btn-close"
                            addClass="ms-auto align-self-start"
                            aria-label="Đóng"
                        />
                        <div className="mt-auto mb-auto">
                            <Icon name="chat" size="48px" addClass="mb-3 text-muted"/>
                            <p className="h5">Chọn một cuộc trò chuyện hoặc bắt đầu trò chuyện mới</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}