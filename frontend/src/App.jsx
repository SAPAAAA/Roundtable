import React from 'react';
import AppRouter from '#routes/index.jsx';
import AuthProvider from "#contexts/AuthContext.jsx";

// --- Main App Entry ---
export default function App() {

    // This is the main entry point for your React application
    return (
        <div className="App">
            <AuthProvider>
                <AuthProvider>
                    <AppRouter/>
                </AuthProvider>
            </AuthProvider>
        </div>
    );
};

