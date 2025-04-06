import React from 'react';
import * as ReactDOM from 'react-dom/client'

import {createBrowserRouter, RouterProvider} from 'react-router';

import './index.css';
import Home from "@pages/Home.jsx";
import App from './App.jsx';
import Login from "@features/auth/pages/Login/Login.jsx";
import Register from "@features/auth/pages/Register/Register.jsx";
import {AuthProvider} from "./features/auth/hooks/AuthContext.jsx";

const router = createBrowserRouter([
    {
        // Routes that use the MainLayout (with Header, Footer, LeftSidebar)
        element: <App/>,
        // ErrorElement: <ErrorBoundary />, // Optional: Add error boundary for this layout
        children: [
            {
                path: "/",
                element: <Home/>
            },
            {
                path: "/comment",
                element: <Home/>
            },
        ],
    },
    {
        // Routes that should NOT use MainLayout (e.g., Login, Register)
        // These render directly without the MainLayout wrapper
        path: "/login",
        element: <Login/>, // Render Login page directly
    },
    {
        path: "/register",
        element: <Register/>, // Render Register page directly
    },
    {
        // Catch-all or 404 route - decide which layout it belongs to or none
        path: "*",
        // element: <NotFoundPage />, // Example: Render a 404 component
        element: <div>Page Not Found</div> // Simple placeholder
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </React.StrictMode>
);