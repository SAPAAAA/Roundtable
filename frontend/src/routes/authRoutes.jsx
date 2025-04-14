import React, {lazy} from 'react';

// Lazy-loaded components
const Login = lazy(() => import('@features/auth/pages/Login/Login'));
const Register = lazy(() => import('@features/auth/pages/Register/Register'));

const authRoutes = [
    {
        path: "/login",
        element: <Login/>,
    },
    {
        path: "/register",
        element: <Register/>,
        action: async ({request}) => {
            const formData = await request.formData();
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Response('Failed to register', {status: response.status});
            }

            // Return the backend response as JSON.
            return response.json();
        },
    },
];

export default authRoutes;