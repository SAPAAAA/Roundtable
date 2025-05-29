import React, {useCallback, useEffect, useState, useRef} from "react";
import NotificationContext from "#contexts/NotificationContext.jsx";
import useAuth from "#hooks/useAuth.jsx";
import notificationService from "#services/notificationService.jsx";
import WebSocketSubject from "#subjects/WebsocketSubject.jsx";
import NotificationObserver from "#observers/NotificationObserver.jsx";

const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingCount, setIsLoadingCount] = useState(true);
    const observerRef = useRef(null);

    const {user} = useAuth();

    // Kết nối WebSocket và đăng ký observer khi component mount
    useEffect(() => {
        let isMounted = true;
        
        // Chỉ kết nối khi đã đăng nhập
        if (user?.userId) {
            // Tạo observer nếu chưa có
            if (!observerRef.current && addNotification) {
                observerRef.current = new NotificationObserver(addNotification);
            }
            
            // Kết nối WebSocket và đăng ký observer
            WebSocketSubject.connect(user.userId)
                .then(() => {
                    if (isMounted) {
                        WebSocketSubject.subscribe(observerRef.current);
                    }
                })
                .catch(err => {
                    console.error('[NotificationProvider] WebSocket connection failed:', err?.message || err);
                });
        }
        
        return () => {
            isMounted = false;
            // Hủy đăng ký observer khi unmount
            if (observerRef.current) {
                WebSocketSubject.unsubscribe(observerRef.current);
            }
        };
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        const fetchCount = async () => {
            if (user?.userId) {
                setIsLoadingCount(true);
                try {
                    const count = await notificationService.getUnreadCount();
                    if (isMounted) {
                        setUnreadCount(count);
                    }
                } catch (error) {
                    console.error("Error fetching unread count:", error);
                    if (isMounted) {
                        setUnreadCount(0);
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingCount(false);
                    }
                }
            } else {
                setUnreadCount(0);
                setNotifications([]);
                setIsLoadingCount(false);
            }
        };

        fetchCount();
        return () => {
            isMounted = false;
        };
    }, [user]);

    const initializeNotifications = useCallback((initialNotifications) => {
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter(n => !n.isRead).length);
    }, []);

    const addNotification = useCallback((newNotificationData) => {
        const alreadyExists = notifications.some(n => n.notificationId === newNotificationData.notificationId);
        let shouldIncrementCount = false;

        if (!alreadyExists && !newNotificationData.isRead) {
            shouldIncrementCount = true;
        }

        setNotifications(prev => {
            if (prev.some(n => n.notificationId === newNotificationData.notificationId)) {
                return prev;
            }
            return [newNotificationData, ...prev].slice(0, 50);
        });

        setUnreadCount(prevCount => prevCount + (shouldIncrementCount ? 1 : 0));
    }, [notifications]);

    const markAsRead = useCallback(async (notificationId) => {
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
        const response = await notificationService.markAsRead(notificationId);

        if (wasUnread) {
            setUnreadCount(prevCount => prevCount - 1);
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        // TODO: API call to clear on backend
    }, []);

    const value = {
        initializeNotifications,
        notifications,
        unreadCount,
        isLoadingCount,
        addNotification,
        markAsRead,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
