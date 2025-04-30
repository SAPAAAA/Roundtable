import React, {useEffect} from 'react';
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
    const {notifications, unreadCount, initializeNotifications, markAsRead} = useNotifications();
    useEffect(() => {
        // Check if initialNotificationData exists and has the expected structure
        if (initialNotificationData && Array.isArray(initialNotificationData)) {
            initializeNotifications(initialNotificationData);
        }
        // Run only when initialNotificationData or initializeNotifications changes
    }, [initialNotificationData, initializeNotifications]);

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
                {notifications.length > 0 ? (
                    notifications.map(notification => (
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