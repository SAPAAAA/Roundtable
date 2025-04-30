import React, {useEffect, useState} from 'react';
import './NotificationsView.css';
import NotificationItem from '#features/notifications/components/NotificationItem/NotificationItem.jsx';
import useNotifications from '#hooks/useNotifications.jsx';
import {useLoaderData} from "react-router";

// Mock notification data (replace with actual data fetching later)
const mockNotifications = [
    {id: 1, type: 'comment_reply', user: 'John Doe', postTitle: 'My first post', time: '2 hours ago', read: false},
    {
        id: 2,
        type: 'post_upvote',
        user: 'Jane Smith',
        postTitle: 'A cool tech discovery',
        time: '5 hours ago',
        read: true
    },
    {id: 3, type: 'new_follower', user: 'Alex Green', time: '1 day ago', read: false},
];

export default function NotificationsView() {
    // Get initial data from the loader
    const initialNotificationData = useLoaderData();

    // Use context for real-time updates and unread count
    const {notifications: realTimeNotifications, markAsRead, unreadCount} = useNotifications();

    // State to hold the combined/displayed list
    // Initialize with loader data if available
    const [displayedNotifications, setDisplayedNotifications] = useState(initialNotificationData?.notifications || []);
    useEffect(() => {
        const loadedIds = new Set((initialNotificationData?.notifications || []).map(n => n.notificationId));
        const newRealTime = realTimeNotifications.filter(rt => !loadedIds.has(rt.notificationId));

        setDisplayedNotifications([
            ...newRealTime, // Add new notifications from WebSocket first
            ...(initialNotificationData?.notifications || []) // Then add loaded notifications
        ].slice(0, 50)); // Limit display

        console.log("Updated displayed notifications:", displayedNotifications);

    }, [initialNotificationData, realTimeNotifications]);

    const handleMarkAsRead = (id) => {
        console.log("Marking as read (UI only):", id);
        markAsRead(id); // Update context state (which should ideally trigger API call)
    };

    return (
        <div className="notifications-page-container card">
            <h2 className="card-header d-flex justify-content-between align-items-center">
                <span>Notifications</span>
                {/* Optional: Button to mark all as read */}
            </h2>
            <div className="list-group list-group-flush">
                {displayedNotifications.length > 0 ? (
                    displayedNotifications.map(notification => (
                        <NotificationItem
                            key={notification.notificationId}
                            notification={notification}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)} // Mark as read on click if unread
                        />
                    ))
                ) : (
                    <p className="p-3 text-muted text-center">You have no notifications.</p>
                )}
            </div>
        </div>
    );
}