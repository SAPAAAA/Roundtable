import React, {useState} from 'react'; // Added Suspense
import './MainLayout.css';
import {useAuth} from "@hooks/useAuth.jsx";

// Lazy load components
const Header = React.lazy(() => import("@shared/components/layout/Header/Header.jsx"));
const Content = React.lazy(() => import("@shared/components/layout/Content/Content.jsx"));
const Footer = React.lazy(() => import("@shared/components/layout/Footer/Footer.jsx"));
const LoginModal = React.lazy(() => import("@features/auth/components/LoginModal/LoginModal.jsx"));
const RegisterModal = React.lazy(() => import("@features/auth/components/RegisterModal/RegisterModal.jsx"));


export default function MainLayout() {
    // Keep login logic, remove register logic as it's handled by the Action
    const {login, isLoading, error: authError} = useAuth();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // --- Modal Visibility State ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // --- Error State for Login ---
    // Keep this for errors returned from the login API call via useAuth
    const [loginApiError, setLoginApiError] = useState(null);
    // REMOVE registrationApiError state


    // --- Handlers ---
    const toggleSidebar = () => setSidebarVisible(prev => !prev);

    // --- Modal Control ---
    const openLoginModal = () => {
        // REMOVE setRegistrationApiError(null);
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
        setLoginApiError(null); // Clear login error when opening
    };
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setLoginApiError(null); // Clear error on close
    }

    const openRegisterModal = () => {
        setLoginApiError(null); // Clear login errors if any
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
        // REMOVE setRegistrationApiError(null); // Error is handled inside RegisterModal now
    };
    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
        // REMOVE setRegistrationApiError(null);
    }

    // --- Login Form Submission Handler (remains the same) ---
    const handleLoginSubmit = async (email, password) => {
        setLoginApiError(null); // Clear previous error
        const success = await login(email, password);
        if (success) {
            closeLoginModal();
        } else {
            // Use the error from the auth context or a default
            setLoginApiError(authError || "Đăng nhập không thành công.");
        }
    };

    // REMOVE handleRegisterSubmit - It's handled by the Action now

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
                openLoginModal={openLoginModal}
                // Optionally pass openRegisterModal if needed in Header
                openRegisterModal={openRegisterModal}
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
                isLoading={isLoading} // Login modal still uses isLoading from useAuth
                authError={loginApiError}
            />

            {/* Render the Register Modal Component */}
            {/* Remove onSubmit, isLoading, apiError props */}
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={closeRegisterModal}
                onSwitchToLogin={switchToLogin}
            />
        </div>
    );
}