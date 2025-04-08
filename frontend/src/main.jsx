import React, {lazy, Suspense} from 'react';
import * as ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router';

import './index.css';
import App from './App';
import {AuthProvider} from "@contexts/AuthContext.jsx";

// Lazy-loaded pages
const Home = lazy(() => import('@pages/Home.jsx'));
const Login = lazy(() => import('@features/auth/pages/Login/Login.jsx'));
const Register = lazy(() => import('@features/auth/pages/Register/Register.jsx'));
// const NotFoundPage = lazy(() => import('@pages/NotFoundPage.jsx'));

const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: "comment",
                element: <Home/>
            },
            {
                path: "post",
                element: <PostDetail/>
            }
        ],
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "*",
        element: <div>Page Not Found</div>
        // element: <NotFoundPage />
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Suspense fallback={<div>Loading Application...</div>}>
            <AuthProvider>
                <RouterProvider router={router}/>
            </AuthProvider>
        </Suspense>
    </React.StrictMode>
);
