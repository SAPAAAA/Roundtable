// frontend/src/services/websocketService.js

let socket = null;
let messageListeners = [];
let connectionPromise = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

// Determine WebSocket protocol based on HTTP protocol
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// Construct WebSocket URL targeting the backend server
const wsUrl = `${wsProtocol}//${window.location.hostname}:5000`;

function connectWebSocket(userId) {
    if (connectionPromise) {
        console.log("[WebSocket Service] Connection attempt already in progress.");
        return connectionPromise;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("[WebSocket Service] Connection already open.");
        return Promise.resolve(socket);
    }

    console.log(`[WebSocket Service] Attempting to connect to ${wsUrl} for user ${userId}...`); // URL now includes port 5000

    connectionPromise = new Promise((resolve, reject) => {
        // Connect to the explicit backend URL
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("[WebSocket Service] Connection established.");
            reconnectAttempts = 0;
            connectionPromise = null;
            resolve(socket);
        };

        socket.onmessage = (event) => {
            try {
                if (event.data === 'pong') {
                    return;
                }
                const data = JSON.parse(event.data);
                console.log("[WebSocket Service] Message received:", data);
                messageListeners.forEach(listener => listener(data));
            } catch (error) {
                console.error("[WebSocket Service] Error parsing message or listener error:", error, "Raw data:", event.data);
            }
        };

        socket.onerror = (error) => {
            console.error("[WebSocket Service] Connection error:", error);
            connectionPromise = null;
            reject(error);
            handleDisconnect(userId);
        };

        socket.onclose = (event) => {
            console.log(`[WebSocket Service] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
            socket = null;
            connectionPromise = null;
            // Don't automatically reconnect for codes like 401 Unauthorized or 1001 Going Away
            if (event.code !== 1000 && event.code !== 1001 && event.code !== 1008 && event.code < 4000) {
                handleDisconnect(userId);
            } else {
                messageListeners = [];
            }
        };
    });

    return connectionPromise;
}

function handleDisconnect(userId) {
    // ... (reconnect logic remains the same)
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`[WebSocket Service] Attempting reconnect ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY_MS / 1000}s...`);
        setTimeout(() => connectWebSocket(userId), RECONNECT_DELAY_MS);
    } else {
        console.error(`[WebSocket Service] Max reconnect attempts reached for user ${userId}. Giving up.`);
        messageListeners = [];
    }
}

// Keepalive ping interval
setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        // console.log('[WebSocket Service] Sending ping');
        socket.send('ping');
    }
}, 30000);

export const websocketService = {
    connect: (userId) => {
        if (!userId) {
            console.warn("[WebSocket Service] Cannot connect without userId.");
            return Promise.reject("User ID is required to connect WebSocket.");
        }
        // Ensure connectWebSocket is called if socket is not open or doesn't exist
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return connectWebSocket(userId);
        }
        return Promise.resolve(socket); // Return resolved promise if already connected
    },
    disconnect: () => {
        if (socket) {
            console.log("[WebSocket Service] Disconnecting...");
            reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnect on manual disconnect
            socket.close(1000, "User disconnected"); // 1000 Normal closure
            socket = null;
            messageListeners = []; // Clear listeners on disconnect
        }
    },
    sendMessage: (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.error("[WebSocket Service] Cannot send message, socket not open.");
            // Optionally queue message or try reconnecting
        }
    },
    // Allow components to subscribe to incoming messages
    addMessageListener: (callback) => {
        if (typeof callback === 'function' && !messageListeners.includes(callback)) {
            messageListeners.push(callback);
        }
    },
    // Allow components to unsubscribe
    removeMessageListener: (callback) => {
        messageListeners = messageListeners.filter(listener => listener !== callback);
    }
};

export default websocketService;