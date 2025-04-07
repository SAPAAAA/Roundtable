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
        element: <App/>,
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
        // element: <NotFoundPage />,
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