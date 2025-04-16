// src/routes/authRoutes.jsx (Or wherever your file is)
import React, {lazy} from 'react';
// Import the new utility function (adjust the path as necessary)
import loginAction from "@features/auth/pages/Login/loginAction.js";
import registerAction from "@features/auth/pages/Register/registerAction.js";
import verifyEmailAction from "@features/auth/pages/VerifyEmail/verifyEmailAction.js";


// Lazy-loaded components (keep as is)
const Login = lazy(() => import('@features/auth/pages/Login/Login'));
const Register = lazy(() => import('@features/auth/pages/Register/Register'));
const VerifyEmail = lazy(() => import('@features/auth/pages/VerifyEmail/VerifyEmail'));

const authRoutes = [
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
        element: <VerifyEmail />,
        action: verifyEmailAction,
    },
];

export default authRoutes;