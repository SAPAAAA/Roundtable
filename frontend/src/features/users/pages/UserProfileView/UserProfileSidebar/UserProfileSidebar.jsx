// src/features/users/pages/UserProfileView/UserProfileSidebar/UserProfileSidebar.jsx
import React, {useEffect, useState} from "react";
import useSidebar from '#hooks/useSidebar.jsx';
import UserInfo from "#features/users/components/UserInfo/UserInfo.jsx";
import Setting from "#features/users/components/Setting/Setting.jsx";
import Button from "#shared/components/UIElement/Button/Button.jsx";
import useChat from "#hooks/useChat.jsx";
import './UserProfileSidebar.css';

function UserProfileSidebar({userProfileData, isOwnProfile}) {
    const {setSidebarParts} = useSidebar();
    const [isChatboxOpen, setIsChatboxOpen] = useState(false);
    const {setActivePartnerId} = useChat();

    // Hàm xử lý khi nhấn nút Chat
    const handleChatClick = () => {
        if (userProfileData && userProfileData.principalId) {
            setActivePartnerId(userProfileData.principalId);
            setIsChatboxOpen(true);
            const chatToggleEvent = new CustomEvent('toggleChat', {
                detail: { partnerId: userProfileData.principalId }
            });
            document.dispatchEvent(chatToggleEvent);
        }
    };

    // Lắng nghe sự kiện đóng chat từ ChatAppWrapper
    useEffect(() => {
        const handleChatClose = () => {
            setIsChatboxOpen(false);
        };

        document.addEventListener('chatClosed', handleChatClose);
        return () => {
            document.removeEventListener('chatClosed', handleChatClose);
        };
    }, []);

    useEffect(() => {
        if (!userProfileData) {
            setSidebarParts(null);
            return;
        }

        const headerContent = (
            <div className="profile-sidebar-header-content">
                {userProfileData.banner && (
                    <img
                        src={userProfileData.banner}
                        alt={`${userProfileData.displayName || userProfileData.username}'s Banner`}
                        className="profile-banner"
                    />
                )}
                <div className="profile-name-sidebar">
                    <h4>{userProfileData.displayName || userProfileData.username}</h4>
                </div>
            </div>
        );

        const bodyContent = (
            <UserInfo
                postKarma={userProfileData.postKarma || userProfileData.karma || "0"}
                commentKarma={userProfileData.commentKarma || userProfileData.karma || "0"}
                createdDay={new Date(userProfileData.accountCreated || userProfileData.createdAt || Date.now()).toLocaleDateString()}
            />
        );

        const footerContent = isOwnProfile ? (
            <Setting/>
        ) : (
            <div className="d-flex flex-column gap-2">
                <Button mainClass="button-8" role="button" onClick={() => console.log('Follow clicked')}>Follow</Button>
                <Button mainClass="button-8" role="button" onClick={handleChatClick}>Chat</Button>
                <Button mainClass="button-8" role="button" onClick={() => console.log('Block clicked')}>Block</Button>
            </div>
        );

        setSidebarParts({
            id: `profile-${userProfileData.userId}`, // Keep the ID if you use it for the cleanup logic
            header: headerContent,
            body: bodyContent,
            footer: footerContent,
        });

        // Cleanup function
        return () => {
            setSidebarParts(null);
        };
    }, [userProfileData, isOwnProfile, setSidebarParts, setActivePartnerId]); // Thêm setActivePartnerId vào dependencies

    return null;
}

export default UserProfileSidebar;