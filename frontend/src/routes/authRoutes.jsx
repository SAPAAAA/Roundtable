import React, {lazy} from 'react';
import loginAction from "@features/auth/pages/Login/loginAction.js";
import registerAction from "@features/auth/pages/Register/registerAction.js";
import verifyEmailAction from "@features/auth/pages/VerifyEmail/verifyEmailAction.js";

// Lazy-loaded components
const Login = lazy(() => import('@features/auth/pages/Login/Login'));
const Register = lazy(() => import('@features/auth/pages/Register/Register'));
const VerifyEmail = lazy(() => import('@features/auth/pages/VerifyEmail/VerifyEmail'));
const AuthLayout = lazy(() => import('@layouts/AuthLayout/AuthLayout'));

const authRoutes = [
    {
        path: "/",
        element: <AuthLayout/>,
        children: [
            {
                path: "/login",
                element: <Login/>,
                // Action now uses the utility function
                action: loginAction,
            },
            {
                path: "/register",
                element: <Register/>,
                action: registerAction,
            },
            {
                path: "/verify-email", // Assuming verification might happen via POST with a token
                element: <VerifyEmail/>,
                action: verifyEmailAction,
            },
        ],
    },
];

export default authRoutes;