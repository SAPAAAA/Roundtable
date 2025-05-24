// src/layouts/MainLayout/MainLayout.jsx
import React, {Suspense, useCallback, useEffect, useState} from 'react';
import './MainLayout.css';
import useAuth from "#hooks/useAuth.jsx";
import useChat from "#hooks/useChat.jsx"; // Import useChat
import useWebSocketNotifications from "#hooks/useWebSocketNotifications.jsx";
import ChatAppWrapper from "#features/chats/components/ChatAppWrapper/ChatAppWrapper";
import useWebSocketChat from "#hooks/useWebSocketChat.jsx";

// Lazy load components
const Header = React.lazy(() => import("#shared/components/layout/Header/Header.jsx"));
const Content = React.lazy(() => import("#shared/components/layout/Content/Content.jsx"));
const Footer = React.lazy(() => import("#shared/components/layout/Footer/Footer.jsx"));
const LoginModal = React.lazy(() => import("#features/auth/components/LoginModal/LoginModal.jsx"));
const RegisterModal = React.lazy(() => import("#features/auth/components/RegisterModal/RegisterModal.jsx"));
const VerifyEmailModal = React.lazy(() => import ('#features/auth/components/VerifyEmailModal/VerifyEmailModal.jsx'));
const CreateProfileModal = React.lazy(() => import ('#features/auth/components/CreateProfileModal/CreateProfileModal.jsx'));
const CreateSubtableModal = React.lazy(() => import("#features/subtables/components/CreateSubtableModal/CreateSubtableModal.jsx"));
const LoadingSpinner = React.lazy(() => import ('#shared/components/UIElement/LoadingSpinner/LoadingSpinner.jsx'));


export default function MainLayout() {
    const {user, isLoading: authIsLoading, checkSession} = useAuth();
    const {isChatboxOpen, toggleChatVisibility, openChatWithUser} = useChat(); // Get chat functions from context

    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isVerifyEmailModalOpen, setIsVerifyEmailModalOpen] = useState(false);
    const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
    const [isCreateSubtableModalOpen, setIsCreateSubtableModalOpen] = useState(false);

    const [emailToVerify, setEmailToVerify] = useState('');
    const [profileIdToCreate, setProfileIdToCreate] = useState('');


    useWebSocketNotifications();
    useWebSocketChat();

    const toggleSidebar = () => setSidebarVisible(prev => !prev);
    // toggleChat is now managed by ChatContext's toggleChatVisibility

    const openLoginModal = useCallback(() => {
        setIsRegisterModalOpen(false);
        setIsVerifyEmailModalOpen(false);
        setIsCreateProfileModalOpen(false);
        setIsLoginModalOpen(true);
    }, []);

    const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

    const openRegisterModal = useCallback(() => {
        setIsLoginModalOpen(false);
        setIsVerifyEmailModalOpen(false);
        setIsCreateProfileModalOpen(false);
        setIsRegisterModalOpen(true);
    }, []);

    const closeRegisterModal = useCallback(() => setIsRegisterModalOpen(false), []);

    const openVerifyEmailModal = useCallback((email) => {
        setEmailToVerify(email);
        setIsRegisterModalOpen(false);
        setIsVerifyEmailModalOpen(true);
    }, []);

    const closeVerifyEmailModal = useCallback(() => setIsVerifyEmailModalOpen(false), []);

    const openCreateProfileModal = useCallback((profileId) => {
        setProfileIdToCreate(profileId);
        setIsVerifyEmailModalOpen(false);
        setIsCreateProfileModalOpen(true);
    }, []);

    const closeCreateProfileModal = useCallback(() => setIsCreateProfileModalOpen(false), []);


    const openCreateSubtableModal = useCallback(() => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsCreateSubtableModalOpen(true);
    }, []);

    const closeCreateSubtableModal = useCallback(() => setIsCreateSubtableModalOpen(false), []);


    const switchToRegister = useCallback(() => {
        closeLoginModal();
        openRegisterModal();
    }, [closeLoginModal, openRegisterModal]);

    const switchToLogin = useCallback(() => {
        closeRegisterModal();
        openLoginModal();
    }, [closeRegisterModal, openLoginModal]);

    const handleRegistrationSuccess = useCallback((email) => {
        openVerifyEmailModal(email);
    }, [openVerifyEmailModal]);

    const handleVerificationSuccess = useCallback((profileId) => {
        openCreateProfileModal(profileId);
    }, [openCreateProfileModal]);

    const handleProfileCreationSuccess = useCallback(() => {
        closeCreateProfileModal();
        openLoginModal();
    }, [closeCreateProfileModal, openLoginModal]);


    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (user && !authIsLoading) {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(false);
            setIsVerifyEmailModalOpen(false);
            setIsCreateProfileModalOpen(false);
            setIsCreateSubtableModalOpen(false);
        }
    }, [user, authIsLoading]);

    return (
        <Suspense
            fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <LoadingSpinner message="Đang tải bố cục trang..."/></div>}>
            <Header
                toggleChat={toggleChatVisibility} // Pass the new function from context
                openChatWithUser={openChatWithUser} // Pass the new function
                toggleSidebar={toggleSidebar}
                isSidebarVisible={isSidebarVisible}
                openLoginModal={openLoginModal}
                openCreateSubtableModal={openCreateSubtableModal}
            />

            <Content
                toggleSidebar={toggleSidebar}
                isSidebarVisible={isSidebarVisible}
                // Pass openChatWithUser down if Content needs to propagate it further
                // For UserProfileSidebar, it will get it via useChat() directly if UserProfileSidebar is wrapped by ChatProvider
                // Or if UserProfileView passes it down. Let's assume UserProfileView handles passing it.
            />

            <Footer/>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                onSwitchToRegister={switchToRegister}
            />

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={closeRegisterModal}
                onSwitchToLogin={switchToLogin}
                onRegistrationSuccess={handleRegistrationSuccess}
            />

            <VerifyEmailModal
                isOpen={isVerifyEmailModalOpen}
                onClose={closeVerifyEmailModal}
                emailToVerify={emailToVerify}
                onVerificationSuccess={handleVerificationSuccess}
            />

            <CreateProfileModal
                isOpen={isCreateProfileModalOpen}
                onClose={closeCreateProfileModal}
                profileIdToCreate={profileIdToCreate}
                onProfileCreationSuccess={handleProfileCreationSuccess}
            />

            <CreateSubtableModal
                isOpen={isCreateSubtableModalOpen}
                onClose={closeCreateSubtableModal}
            />

            <ChatAppWrapper
                isOpen={isChatboxOpen}
                toggleChatVisibility={toggleChatVisibility}
            />
        </Suspense>
    );
}