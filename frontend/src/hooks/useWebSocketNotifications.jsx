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
            }

            console.log('[useWebSocketNotifications] Observer received data:', data);
            // --- Adjusted based on latest log: backend sends notification nested ---
            if (data && data.type === 'NEW_COMMENT_NOTIFICATION' && data.notification) {
                addNotification(data.notification);
            }
        };

        if (user && user.userId) {
            websocketService.connect(user.userId)
                .then(() => {
                    if (isMounted) {
                        console.log('[useWebSocketNotifications] WebSocket connected, subscribing observer.');
                        // --- Use subscribe ---
                        websocketService.subscribe(handleWebSocketMessage);
                    }
                })
                .catch(err => {
                    console.error('[useWebSocketNotifications] WebSocket connection failed:', err);
                });
        } else {
            websocketService.disconnect();
        }

        return () => {
            isMounted = false;
            console.log('[useWebSocketNotifications] Component unmounted, removing listener and disconnecting WebSocket.');
            websocketService.unsubscribe(handleWebSocketMessage);
            if (!user) {
                websocketService.disconnect();
            }
        }
    }, [user, addNotification]);
}

export default useWebSocketNotifications;

