import React from 'react';
import './NotificationItem.css';
import Icon from '#shared/components/UIElement/Icon/Icon'; // Assuming Icon component exists
import {formatTimeAgo} from '#utils/time'; // Assuming time utility exists
import Link from '#shared/components/Navigation/Link/Link'; // Use your Link component

export default function NotificationItem({notification}) {
    const getNotificationText = () => {
        switch (notification.type) {
            case 'comment_reply':
                return <><strong>{notification.user}</strong> replied to your comment on "{notification.postTitle}"</>;
            case 'post_upvote':
                return <><strong>{notification.user}</strong> upvoted your post "{notification.postTitle}"</>;
            case 'new_follower':
                return <><strong>{notification.user}</strong> started following you</>;
            default:
                return 'New notification';
        }
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'comment_reply':
                return 'comment';
            case 'post_upvote':
                return 'upvote';
            case 'new_follower':
                return 'person';
            default:
                return 'bell';
        }
    };

    // Example link, adjust based on notification type
    const notificationLink = notification.type === 'new_follower'
        ? `/profile/${notification.user}`
        : `/comments/${notification.postId || notification.id}`; // Adjust logic as needed

    return (
        <Link href={notificationLink}
              className={`notification-item list-group-item list-group-item-action d-flex align-items-start ${!notification.read ? 'unread' : ''}`}>
            <Icon name={getNotificationIcon()} size="18px" addClass="me-3 mt-1 notification-icon"/>
            <div className="notification-content">
                <div className="notification-text">{getNotificationText()}</div>
                <small className="text-muted">{formatTimeAgo(notification.time)}</small>
            </div>
            {!notification.read && <span className="unread-dot ms-auto"></span>}
        </Link>
    );
}