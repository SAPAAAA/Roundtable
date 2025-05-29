// src/hooks/useWebSocketChat.jsx
import {useEffect, useRef} from 'react';
import WebSocketSubject from '#subjects/WebsocketSubject.jsx';
import ChatObserver from '#observers/ChatObserver.jsx';
import useAuth from '#hooks/useAuth.jsx';
import useChat from '#hooks/useChat.jsx';

function useWebSocketChat() {
    const {user} = useAuth();
    const {addMessage} = useChat();

    // Ref to hold the single instance of the ChatObserver
    const observerRef = useRef(null);
    const connectionRef = useRef(false);

    // --- Initialize the observer instance ---
    useEffect(() => {
        if (!observerRef.current && typeof addMessage === 'function') {
            observerRef.current = new ChatObserver(addMessage);
            console.log("[useWebSocketChat] ChatObserver initialized with addMessage callback");
        } else if (observerRef.current && typeof addMessage !== 'function') {
            console.warn("[useWebSocketChat] addMessage callback became unavailable. Clearing observer ref.");
            observerRef.current = null;
        }
    }, [addMessage]); 

    // --- Effect to manage connection and subscription lifecycle ---
    useEffect(() => {
        let isMounted = true;

        // Đảm bảo observer đã được khởi tạo
        if (!observerRef.current && typeof addMessage === 'function') {
            observerRef.current = new ChatObserver(addMessage);
            console.log("[useWebSocketChat] ChatObserver initialized with addMessage callback");
        }

        const currentObserver = observerRef.current;

        if (!currentObserver) {
            console.log("[useWebSocketChat] Observer not ready.");
            return;
        }

        // Kết nối WebSocket khi có user
        if (user?.userId) {
            console.log(`[useWebSocketChat] User ${user.userId} detected. Connecting WebSocket...`);
            
            // Đảm bảo kết nối WebSocket được thiết lập
            WebSocketSubject.connect(user.userId)
                .then(() => {
                    if (isMounted && observerRef.current) {
                        console.log("[useWebSocketChat] WebSocket connected. Subscribing ChatObserver.");
                        WebSocketSubject.subscribe(observerRef.current);
                        connectionRef.current = true;
                    }
                })
                .catch(err => {
                    console.error('[useWebSocketChat] WebSocket connection failed:', err?.message || err);
                    // Thử kết nối lại sau 3 giây nếu thất bại
                    setTimeout(() => {
                        if (isMounted && user?.userId) {
                            WebSocketSubject.connect(user.userId)
                                .then(() => {
                                    if (isMounted && observerRef.current) {
                                        WebSocketSubject.subscribe(observerRef.current);
                                        connectionRef.current = true;
                                    }
                                })
                                .catch(e => console.error('[useWebSocketChat] Retry connection failed:', e?.message || e));
                        }
                    }, 3000);
                });
        } else {
            console.log("[useWebSocketChat] No user detected. Unsubscribing observer.");
            if (observerRef.current && connectionRef.current) {
                WebSocketSubject.unsubscribe(observerRef.current);
                connectionRef.current = false;
            }
        }

        return () => {
            isMounted = false;
            console.log("[useWebSocketChat] Cleanup: Unsubscribing ChatObserver.");
            if (observerRef.current && connectionRef.current) {
                WebSocketSubject.unsubscribe(observerRef.current);
                connectionRef.current = false;
            }
        };
    }, [user, addMessage]); 
}

export default useWebSocketChat;
