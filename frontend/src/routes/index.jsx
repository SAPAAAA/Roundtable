import React, {Suspense} from "react";
import {createBrowserRouter, RouterProvider} from "react-router"; // Use react-router-dom
// Import the route configurations
import mainRoutes from './mainRoutes';
import authRoutes from './authRoutes';
import errorRoutes from './errorRoutes';
import LoadingSpinner from "@shared/components/UIElement/LoadingSpinner/LoadingSpinner";

// Combine all route configurations into a single array
const allRoutes = [
    mainRoutes,  // Routes inside MainLayout (path: "/")
    ...authRoutes, // Standalone auth routes (paths: "/login", "/register")
    ...errorRoutes  // Standalone error routes (paths: "/404", "*")
];

// Create the router instance
const router = createBrowserRouter(allRoutes);

// Create a component that provides the router and handles Suspense for lazy loading
export default function AppRouter() {
    return (
        // You need a Suspense boundary to handle the lazy loading
        <Suspense fallback={
            <LoadingSpinner
                message="Đang tải nội dung trang..."
                overlayOpacity={0.01}
                mainClass="page-loading"
            />
        }>
            <RouterProvider router={router}/>
        </Suspense>
    );
}