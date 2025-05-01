import React, {createContext, useCallback, useEffect, useState} from 'react';
import {useAuth} from "#hooks/useAuth.jsx";
import notificationService from "#services/notificationService.jsx";

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    initializeNotifications: () => {
    },
    addNotification: () => {
    },
    markAsRead: () => {
    },
    clearNotifications: () => {
    },
});

const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0); // State for the global count
    const [isLoadingCount, setIsLoadingCount] = useState(true); // Loading state for initial count fetch

    const {user} = useAuth();

    // --- Fetch initial unread count when user logs in ---
    useEffect(() => {
        let isMounted = true;
        const fetchCount = async () => {
            if (user && user.userId) { // Check if user is logged in
                setIsLoadingCount(true);
                try {
                    const count = await notificationService.getUnreadCount();
                    if (isMounted) {
                        setUnreadCount(count);
                    }
                } catch (error) {
                    console.error("Error fetching unread count:", error);
                    // Handle error (e.g., user session expired during fetch)
                    if (isMounted) {
                        setUnreadCount(0); // Reset count on error
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingCount(false);
                    }
                }
            } else {
                // If user logs out, reset count
                setUnreadCount(0);
                setNotifications([]); // Also clear the local list
                setIsLoadingCount(false);
            }
        };

        fetchCount();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // --- Initialize state with initial notifications ---
    const initializeNotifications = useCallback((initialNotifications) => {
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter(n => !n.isRead).length);
    }, []);

    // --- Update state based on WebSocket messages ---
    const addNotification = useCallback((newNotificationData) => {
        const alreadyExists = notifications.some(n => n.notificationId === newNotificationData.notificationId);
        let shouldIncrementCount = false;

        if (!alreadyExists && !newNotificationData.isRead) {
            shouldIncrementCount = true;
        }

        // --- Schedule State Update for the List ---
        setNotifications(prev => {
            // Duplicate check inside setNotifications is still a good safeguard
            if (prev.some(n => n.notificationId === newNotificationData.notificationId)) {
                return prev;
            }
            return [newNotificationData, ...prev].slice(0, 50);
        });

        // --- Schedule State Update for the Count ---
        setUnreadCount(prevCount => prevCount + (shouldIncrementCount ? 1 : 0));

    }, [notifications]);

    // --- Update count when marking as read ---
    const markAsRead = useCallback((notificationId) => {
        let wasUnread = false;
        setNotifications(prev =>
            prev.map(n => {
                if (n.notificationId === notificationId) {
                    if (!n.isRead) {
                        wasUnread = true;
                    }
                    return {...n, isRead: true};
                }
                return n;
            })
        );

        // Decrement count only if the notification was previously unread
        if (wasUnread) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1)); // Ensure count doesn't go below 0
        }

        // TODO: Add API call here to mark as read on backend
    }, []); // Stable function

    // --- Update count when clearing notifications ---
    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0); // Reset count to 0
        // TODO: Add API call here to mark all as read or delete on backend
    }, []);

    // --- Context Value ---
    const value = {
        initializeNotifications,
        notifications, // Provide the list for the notification page
        unreadCount,   // Provide the globally accurate count
        isLoadingCount,// Indicate if the initial count is loading
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