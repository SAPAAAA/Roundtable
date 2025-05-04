import {useEffect, useRef} from 'react';
import WebSocketSubject from '#subjects/WebsocketSubject.jsx';
import ChatObserver from '#observers/ChatObserver.jsx';
import useAuth from '#hooks/useAuth.jsx';
import useChat from '#hooks/useChat.jsx';

function useWebSocketChat() {
    const {user} = useAuth();
    const {addMessage} = useChat();
    const observerRef = useRef(null);

    useEffect(() => {
        if (addMessage && !observerRef.current) {
            // Create observer instance if addMessage is available and ref is empty
            observerRef.current = new ChatObserver(addMessage);
            console.log("[useWebSocketChat] ChatObserver instance created.");
        }
    }, [addMessage]);

    useEffect(() => {
        let isMounted = true;
        const currentObserver = observerRef.current;

        if (!currentObserver) {
            // console.log("[useWebSocketChat] Effect run: No observer instance available yet.");
            return;
        }

        if (user?.userId) {
            console.log(`[useWebSocketChat] User ${user.userId} logged in. Connecting/Subscribing.`);
            WebSocketSubject.connect(user.userId)
                .then(() => {
                    if (isMounted && observerRef.current) {
                        console.log("[useWebSocketChat] WebSocket connected. Subscribing ChatObserver.");
                        WebSocketSubject.subscribe(observerRef.current);
                    } else if (isMounted) {
                        console.log("[useWebSocketChat] WebSocket connected but observer ref is null?");
                    }
                })
                .catch(err => {
                    console.error('[useWebSocketChat] WebSocket connection failed:', err?.message || err);
                });
        } else {
            console.log("[useWebSocketChat] No user logged in. Disconnecting/Unsubscribing.");
            if (observerRef.current) {
                WebSocketSubject.unsubscribe(observerRef.current);
            }
            WebSocketSubject.disconnect();
        }

        return () => {
            isMounted = false;
            console.log("[useWebSocketChat] Cleanup: Unsubscribing ChatObserver.");
            if (observerRef.current) {
                WebSocketSubject.unsubscribe(observerRef.current);
            }
        };
    }, [user, addMessage]); // Keep addMessage dependency

}

export default useWebSocketChat;