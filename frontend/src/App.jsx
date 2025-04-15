import React from 'react';
import AppRouter from '@routes/index.jsx';
import AuthProvider from "@contexts/AuthContext.jsx";

// --- Main App Entry ---
export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <AppRouter/>
            </AuthProvider>
        </div>
    );
};

