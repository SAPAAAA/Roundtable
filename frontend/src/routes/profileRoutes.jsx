import ProfileContainer from "#features/users/components/ProfileContainer/ProfileContainer";
import React, {lazy} from "react";
import {RouterProvider} from "react-router";
import useAuth from "#hooks/useAuth.jsx";
import profileService from "#services/profileService";
import { useParams } from "react-router";

// Lazy-loaded pages
const MainLayout = lazy(() => import('#layouts/MainLayout/MainLayout'));
const DetailProfile = lazy(() => import('#features/users/pages/DetailProfileViews/DetailProfile'));
const OtherDetailProfile = lazy(() => import('#features/users/pages/OtherDetailProfileViews/OtherDetailProfile'));

function ProfilePage() {
    const [profileData, setProfileData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const auth = useAuth();
    const { userId: paramUserId } = useParams();
    const authUserId = auth?.user?.userId;

    React.useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await profileService.getUserProfileByUserId(paramUserId);
                console.log('Profile data:', response);
                setProfileData(response.profile);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError(err.message);
            }
        }

        if (paramUserId) {
            fetchProfile();
        }
    }, [paramUserId]);

    if (error) return <div>Error loading profile: {error}</div>;
    if (!profileData) return <div>Loading...</div>;

    // Determine which profile component to render
    const ProfileComponent = paramUserId !== authUserId ? OtherDetailProfile : DetailProfile;

    return (
        <ProfileComponent
            imgUrl={profileData.avatar}
            name={profileData.displayName || profileData.username}
            bannerImgUrl={profileData.banner}
            postKarma={profileData.karma || "0"}
            commentKarma={profileData.karma || "0"}
            createdDay={new Date(profileData.accountCreated).toLocaleDateString()}
            userId={paramUserId}
        />
    );
}

function getProfileRoutesConfig() {
    return [
        {
            path: "Profile/:userId",
            element: 
                <ProfilePage />,
        }
    ];
}

export default getProfileRoutesConfig;