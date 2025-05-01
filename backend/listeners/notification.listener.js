import EventBus from '#core/event-bus.js';
import WebSocketManager from '#core/websocket-manager.js';

EventBus.subscribe('notification.comment.created', ({userId, notification}) => {
    console.log(`[EventBus] Notifying user ${userId} via WebSocket`);

    const payload = {
        type: 'NEW_COMMENT_NOTIFICATION',
        notification
    };

    WebSocketManager.sendNotification(userId, payload);
});
