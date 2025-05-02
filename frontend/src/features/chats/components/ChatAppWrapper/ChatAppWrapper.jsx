// src/features/chats/components/ChatAppWrapper/ChatAppWrapper.jsx
import React, {useState} from 'react';
import ChatSidebar from '#features/chats/components/ChatSidebar/ChatSidebar';
import ChatBox from '#features/chats/components/ChatBox/ChatBox';
import './ChatAppWrapper.css';

// --- Dummy Data ---
const ALL_CHATS = [
    {id: 'chat1', partnerName: 'Alice'},
    {id: 'chat2', partnerName: 'Bob'},
    {id: 'chat3', partnerName: 'Charlie'},
];
const ALL_MESSAGES = {
    chat1: [
        {id: 1, sender: 'Alice', text: 'Hey there!'},
        {id: 2, sender: 'You', text: 'Hi Alice! How are you?'},
        {id: 3, sender: 'Alice', text: 'Doing well, thanks!'},
    ],
    chat2: [
        {id: 4, sender: 'Bob', text: 'Meeting at 3?'},
        {id: 5, sender: 'You', text: 'Yes, sounds good.'},
    ],
    chat3: [
        {id: 6, sender: 'Charlie', text: 'Can you send the report?'},
        {id: 7, sender: 'You', text: 'Sure, sending it now.'},
        {id: 8, sender: 'Charlie', text: 'Thanks!'},
        {id: 9, sender: 'Charlie', text: 'Got it.'},
    ],
};
// --- End Dummy Data ---

export default function ChatAppWrapper(props) {
    const {isOpen = false, toggleChatVisibility} = props; // Default to false (hidden)

    const [selectedChatId, setSelectedChatId] = useState(ALL_CHATS[0]?.id || null);

    const selectedChatDetails = ALL_CHATS.find(chat => chat.id === selectedChatId);
    const messagesForSelectedChat = ALL_MESSAGES[selectedChatId] || [];

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
    };

    // This function now controls the visibility of the entire wrapper
    const handleCloseChat = () => {
        toggleChatVisibility(); // Call the function passed from MainLayout
    };

    // --- Bootstrap Classes for Overlay ---
    const wrapperClasses = `
        chat-app-wrapper
        position-fixed               
        bottom-0                     
        end-0                        
        m-3                          
        z-index-fixed                
        bg-light                     
        border                       
        rounded                      
        shadow-sm                    
        d-flex                       
        flex-row                     
        ${isOpen ? 'visible' : 'hidden'} 
    `; // Use custom visible/hidden classes for transitions

    return (
        <div className={wrapperClasses}> {/* Apply combined classes */}
            {/* Sidebar */}
            <ChatSidebar
                chats={ALL_CHATS}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
            />

            {/* Chat Content Area */}
            <div className="chat-content-area flex-grow-1 d-flex flex-column"> {/* Ensure flex layout */}
                {selectedChatDetails ? (
                    <ChatBox
                        chatPartnerName={selectedChatDetails.partnerName}
                        messages={messagesForSelectedChat}
                        onClose={handleCloseChat} // Pass the close handler to ChatBox
                        // No onClose needed here, handled by the wrapper's close button
                    />
                ) : (
                    <div className="no-chat-selected p-3 text-center text-muted">
                        Select a chat to start messaging.
                    </div>
                )}
            </div>
        </div>
    );
}
