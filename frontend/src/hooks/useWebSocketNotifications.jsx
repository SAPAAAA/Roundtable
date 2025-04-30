// frontend/src/hooks/useWebSocketNotifications.js (NEW HOOK)
import {useEffect} from 'react';
import websocketService from '#services/websocketService.jsx';
import {useAuth} from '#hooks/useAuth.jsx';
import useNotifications from '#hooks/useNotifications.jsx';

function useWebSocketNotifications() {
    const {user} = useAuth();
    const {addNotification} = useNotifications();

    useEffect(() => {
        let isMounted = true;

        const handleWebSocketMessage = (data) => {
            if (!isMounted) {
                return;
            } // Don't update if unmounted

            console.log('[useWebSocketNotifications] Handling message:', data);
            // Check for the specific notification type from the backend
            if (data && data.type === 'NEW_COMMENT_NOTIFICATION') {
                console.log('[useWebSocketNotifications] New comment notification received:', data);
                addNotification(data.notification); // Add the nested data object
            }
        };

        if (user && user.userId) {
            console.log('[useWebSocketNotifications] User found, connecting WebSocket...');
            websocketService.connect(user.userId)
                .then(() => {
                    if (isMounted) {
                        console.log('[useWebSocketNotifications] WebSocket connected, adding listener.');
                        websocketService.addMessageListener(handleWebSocketMessage);
                    }
                })
                .catch(err => {
                    console.error('[useWebSocketNotifications] WebSocket connection failed:', err);
                });
        } else {
            console.log('[useWebSocketNotifications] No user, disconnecting WebSocket.');
            websocketService.disconnect();
        }

        return () => {
            isMounted = false;
            console.log('[useWebSocketNotifications] Component unmounted, removing listener and disconnecting WebSocket.');
            websocketService.removeMessageListener(handleWebSocketMessage);
            if (!user) {
                websocketService.disconnect();
            }
        }
    }, [user, addNotification]);
}

export default useWebSocketNotifications;

