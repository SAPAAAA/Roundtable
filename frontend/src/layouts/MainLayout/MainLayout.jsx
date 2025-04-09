import React, {useState} from 'react';
import './MainLayout.css';
import {useAuth} from "@contexts/AuthContext.jsx";

const Header = React.lazy(() => import("@shared/components/layout/Header/Header.jsx"));
const Content = React.lazy(() => import("@shared/components/layout/Content/Content.jsx"));
const Footer = React.lazy(() => import("@shared/components/layout/Footer/Footer.jsx"));
const LoginModal = React.lazy(() => import("@features/auth/components/LoginModal/LoginModal.jsx"));
const RegisterModal = React.lazy(() => import("@features/auth/components/RegisterModal/RegisterModal.jsx"));

export default function MainLayout() {
    const {login, register, isLoading, error: authError} = useAuth(); // authError is primarily for login/general context errors
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // --- Modal Visibility State ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // --- Error State for Registration ---
    // This state will hold errors returned specifically from the register API call
    const [registrationApiError, setRegistrationApiError] = useState(null);
    // Clear authError when opening register modal, as it's usually login-specific
    const [loginApiError, setLoginApiError] = useState(null);


    // --- Handlers ---
    const toggleSidebar = () => setSidebarVisible(prev => !prev);

    // --- Modal Control ---
    const openLoginModal = () => {
        setRegistrationApiError(null); // Clear registration errors
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
        setLoginApiError(authError); // Pass current authError (if any) to login modal
    };
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setLoginApiError(null); // Clear error on close
    }


    const openRegisterModal = () => {
        setLoginApiError(null); // Clear login errors
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
        setRegistrationApiError(null); // Clear previous registration errors
    };
    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
        setRegistrationApiError(null); // Clear error on close
    }

    // --- Form Submission Handlers (now receive data from modals) ---
    const handleLoginSubmit = async (email, password) => {
        setLoginApiError(null); // Clear previous error
        const success = await login(email, password);
        if (success) {
            closeLoginModal();
        } else {
            // Auth context likely updated 'authError', use it or a default
            setLoginApiError(authError || "Đăng nhập không thành công.");
        }
    };

    const handleRegisterSubmit = async (userData) => {
        setRegistrationApiError(null); // Clear previous error
        // userData now comes from RegisterModal { fullName, username, email, password }
        const result = await register(userData);
        if (result.success) {
            closeRegisterModal();
            // Optionally: Automatically open login modal or show success message
            // openLoginModal(); // Example: open login after successful registration
        } else {
            // Set the specific registration error state to pass to the modal
            setRegistrationApiError(result.message || authError || "Đăng ký không thành công.");
        }
    };

    // --- Modal Switching ---
    const switchToRegister = () => {
        closeLoginModal();
        openRegisterModal();
    };

    const switchToLogin = () => {
        closeRegisterModal();
        openLoginModal();
    };


    return (
        <div>
            <Header
                toggleSidebar={toggleSidebar}
                isSidebarVisible={isSidebarVisible}
                openLoginModal={openLoginModal} // Pass function to open login
                // You might also want a button/link in Header to open register directly
                // openRegisterModal={openRegisterModal}
            />

            <Content
                toggleSidebar={toggleSidebar}
                isSidebarVisible={isSidebarVisible}
            />

            <Footer/>

            {/* Render the Login Modal Component */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                onSubmit={handleLoginSubmit}
                onSwitchToRegister={switchToRegister}
                isLoading={isLoading}
                authError={loginApiError} // Pass login-specific API error
            />

            {/* Render the Register Modal Component */}
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={closeRegisterModal}
                onSubmit={handleRegisterSubmit}
                onSwitchToLogin={switchToLogin}
                isLoading={isLoading}
                apiError={registrationApiError} // Pass registration-specific API error
            />
        </div>
    );
}