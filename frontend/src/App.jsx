import React from 'react';
import AppRouter from '#routes/index.jsx';
import AuthProvider from "#providers/AuthProvider.jsx";
import NotificationProvider from "#providers/NotificationProvider.jsx";

// --- Main App Entry ---
export default function App() {

    // This is the main entry point for your React application
    return (
        <div className="App">
            <AuthProvider>
                <NotificationProvider>
                    <AppRouter/>
                </NotificationProvider>
            </AuthProvider>
        </div>
    );
};

