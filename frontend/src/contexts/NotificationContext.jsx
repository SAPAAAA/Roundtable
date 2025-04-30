// frontend/src/contexts/NotificationContext.jsx
import React, {createContext, useCallback, useEffect, useState} from 'react';

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    addNotification: () => {
    },
    markAsRead: () => {
    },
    clearNotifications: () => {
    },
});
const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const addNotification = useCallback((newNotificationData) => {
        console.log("[NotificationContext] addNotification CALLED with:", newNotificationData); // <-- Log entry
        setNotifications(prev => {
            if (prev.some(n => n.notificationId === newNotificationData.notificationId)) {
                console.log("Notification already exists, skipping:", newNotificationData);
                return prev; // Already exists
            }
            // Add new notification to the beginning of the array
            return [newNotificationData, ...prev].slice(0, 50); // Keep max 50 notifications
        });
        console.log("New notification added to context:", newNotificationData);
    }, []);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.notificationId === notificationId ? {...n, isRead: true} : n
            )
        );
        // TODO: Add API call here to mark notification as read on the backend
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        // TODO: Add API call here to mark all as read or delete on backend if needed
    }, []);

    const updateUnreadCount = useCallback(() => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    }, [notifications]);

    useEffect(() => {
        updateUnreadCount();
    }, [notifications, updateUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationProvider;
export {NotificationContext}
