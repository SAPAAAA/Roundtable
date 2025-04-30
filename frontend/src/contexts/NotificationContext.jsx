import React, {createContext, useCallback, useState} from 'react';

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    initializeNotifications: (initialNotifications) => {
    }, // Add placeholder
    addNotification: () => {
    },
    markAsRead: () => {
    },
    clearNotifications: () => {
    },
});

const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([]);

    // Function to load initial notifications
    const initializeNotifications = useCallback((initialNotifications) => {
        console.log("[NotificationContext] Initializing notifications with:", initialNotifications);
        // Ensure initialNotifications is an array
        if (Array.isArray(initialNotifications)) {
            setNotifications(initialNotifications.slice(0, 50)); // Replace and limit
        } else {
            console.warn("[NotificationContext] initializeNotifications called with non-array:", initialNotifications);
            setNotifications([]); // Reset to empty if invalid data received
        }
    }, []);

    const addNotification = useCallback((newNotificationData) => {
        console.log("[NotificationContext] addNotification CALLED with:", newNotificationData);
        setNotifications(prev => {
            // Prevent duplicates based on notificationId
            if (prev.some(n => n.notificationId === newNotificationData.notificationId)) {
                console.log("[NotificationContext] Notification already exists, skipping:", newNotificationData.notificationId);
                return prev;
            }
            // Add new notification to the beginning and limit array size
            const updatedNotifications = [newNotificationData, ...prev].slice(0, 50);
            console.log("[NotificationContext] New notification added, updated list:", updatedNotifications);
            return updatedNotifications;
        });
    }, []); // Empty dependency array, stable function

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.notificationId === notificationId ? {...n, isRead: true} : n
            )
        );
        // TODO: Add API call here
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        // TODO: Add API call here
    }, []);

    // Calculate unreadCount directly from the current notifications state
    const currentUnreadCount = notifications.filter(n => !n.isRead).length;

    const value = {
        notifications,
        unreadCount: currentUnreadCount, // Use the directly calculated count
        initializeNotifications,         // Expose the initialization function
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
export {NotificationContext};