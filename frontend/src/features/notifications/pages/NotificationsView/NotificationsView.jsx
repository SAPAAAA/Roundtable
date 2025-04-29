import React from 'react';
import './NotificationsView.css';
import NotificationItem from '#features/notifications/components/NotificationItem/NotificationItem.jsx';

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
    return (
        <div className="notifications-page-container card">
            <h2 className="card-header">Notifications</h2>
            <div className="list-group list-group-flush">
                {mockNotifications.length > 0 ? (
                    mockNotifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification}/>
                    ))
                ) : (
                    <p className="p-3 text-muted">No new notifications.</p>
                )}
            </div>
        </div>
    );
}