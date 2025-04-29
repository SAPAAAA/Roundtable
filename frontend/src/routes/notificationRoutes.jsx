// src/routes/notificationRoutes.jsx
import React, {lazy} from 'react';

const NotificationsView = lazy(() => import('#features/notifications/pages/NotificationsView/NotificationsView'));

function getNotificationRoutesConfig() {
    return [
        {
            path: "/notifications",
            element: <NotificationsView/>,
            // loader: notificationLoader,
        }
    ];
}

export default getNotificationRoutesConfig;