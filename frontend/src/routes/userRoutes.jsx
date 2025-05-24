// src/routes/profileRoutes.jsx
import React, {lazy} from "react";
import useAuth from "#hooks/useAuth.jsx";
import profileLoader from "#features/users/loaders/profileLoader.jsx";
import {useLoaderData} from "react-router";

// Lazy-loaded page component
const UserProfileView = lazy(() => import('#features/users/pages/UserProfileView/UserProfileView.jsx'));

function ProfilePageWrapper() {
    const {userProfileData} = useLoaderData();
    const auth = useAuth();
    const authUserId = auth?.user?.userId;

    // Error handling for loader data should ideally be done with route's errorElement
    // This is a fallback or for cases where loader returns data but it's insufficient
    if (!userProfileData) {
        return <div>Error loading profile data or profile not found. Please try again.</div>;
    }

    const isOwnProfile = !!authUserId && userProfileData.userId === authUserId;

    return (
        <UserProfileView
            userProfileData={userProfileData}
            isOwnProfile={isOwnProfile}
        />
    );
}

function getUserRoutesConfig() {
    return [
        {
            path: "user/:username",
            element: <ProfilePageWrapper/>,
            loader: profileLoader,
        }
    ];
}

export default getUserRoutesConfig;