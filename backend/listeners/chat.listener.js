// backend/listeners/chat.listener.js
import EventBus from '#core/event-bus.js';
import WebSocketManager from '#core/websocket-manager.js';

EventBus.subscribe('chat.message.created', async (payload) => {
    const {recipientUserId, message} = payload;

    console.log('[ChatListener] Recipient User ID:', recipientUserId);
    console.log('[ChatListener] Message:', message);

    if (!recipientUserId || !message || !message.messageId) {
        console.error('[ChatListener] Received invalid payload for chat.message.created:', payload);
        return;
    }

    console.log(`[ChatListener] Received 'chat.message.created' event for recipient: ${recipientUserId}`);

    try {
        // **Option 1 (Preferred if payload contains full UserMessageDetails):**
        const webSocketPayload = {
            type: 'NEW_CHAT_MESSAGE', // Define a type for frontend observer
            message: message // The full message object (ideally UserMessageDetails structure)
        };

        // Send the payload via WebSocketManager to the recipient
        WebSocketManager.sendNotification(recipientUserId, webSocketPayload); // Use sendNotification or rename it
        console.log(`[ChatListener] Sent NEW_CHAT_MESSAGE notification to user ${recipientUserId}`);

    } catch (error) {
        console.error(`[ChatListener] Error processing chat.message.created event for recipient ${recipientUserId}:`, error);
    }
});

// EventBus.subscribe('chat.typing.started', (payload) => { ... });
// EventBus.subscribe('chat.read', (payload) => { ... });

