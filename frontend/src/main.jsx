import React, {Suspense} from 'react';
import * as ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import AuthProvider from "@contexts/AuthContext.jsx";
import SidebarProvider from "@contexts/SidebarContext.jsx";
import LoadingSpinner from "@shared/components/UIElement/LoadingSpinner/LoadingSpinner";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Suspense fallback={
            <LoadingSpinner
                message="Đang tải nội dung trang..."
                overlayOpacity={0.01}
                mainClass="page-loading"
            />
        }>
            <AuthProvider>
                <SidebarProvider>
                    <App/>
                </SidebarProvider>
            </AuthProvider>
        </Suspense>
    </React.StrictMode>
);
