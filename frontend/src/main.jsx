import React from 'react';
import * as ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import AuthProvider from "@contexts/AuthContext.jsx";
import SidebarProvider from "@contexts/SidebarContext.jsx";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <SidebarProvider>
                <App/>
            </SidebarProvider>
        </AuthProvider>
    </React.StrictMode>
);
