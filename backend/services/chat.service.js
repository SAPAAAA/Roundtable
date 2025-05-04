// backend/services/chatService.js

import MessageDAO from '#daos/message.dao.js';
import UserMessageDetailsDAO from '#daos/user-message-details.dao.js';
import RegisteredUserDAO from '#daos/registered-user.dao.js'; // For validating users
import Message, {MessageTypeEnum} from '#models/message.model.js';
import EventBus from '#core/event-bus.js';
import {BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from '#errors/AppError.js';

class ChatService {
    constructor(msgDAO, userMsgDetailsDAO, regUserDAO, eventBus) {
        this.messageDAO = msgDAO;
        this.userMessageDetailsDAO = userMsgDetailsDAO;
        this.registeredUserDAO = regUserDAO;
        this.eventBus = eventBus;
    }

    /**
     * Retrieves the list of conversation partners (with latest message details) for a user.
     * NOTE: Uses userMessageDetailsDAO.getConversationList which might be inefficient.
     * Consider optimizing with a dedicated SQL query if performance issues arise.
     * @param {string} userId - The ID of the user whose conversations to fetch.
     * @returns {Promise<Array<import('#models/user-message-details.model').UserMessageDetails>>} - List of latest message details per partner.
     */
    async getConversationPartnersPreviewData(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch conversations.');
        }
        try {
            return await this.messageDAO.getConversationPartnersPreviewData(userId);
        } catch (error) {
            console.error(`[ChatService] Error fetching conversations for user ${userId}:`, error);
            // Don't expose internal errors directly
            throw new InternalServerError('Could not retrieve conversation list.');
        }
    }

    /**
     * Retrieves the message history between two users.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} partnerUserId - The ID of the other user in the conversation.
     * @param {import('#daos/message.dao').GetMessagesOptions} [options={}] - Pagination options.
     * @returns {Promise<Array<import('#models/user-message-details.model').UserMessageDetails>>} - Array of detailed messages.
     */
    async getMessages(requestingUserId, partnerUserId, options = {}) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Both requesting user ID and partner user ID are required.');
        }

        // Validate partner user exists and is active (optional, based on requirements)
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }
        // Example: Disallow fetching messages if partner is banned (adjust as needed)
        if (partnerUser.status === 'banned') {
            throw new ForbiddenError(`Cannot retrieve messages for a banned user.`);
        }

        try {
            // Fetch detailed messages using the view DAO, passing requestingUserId for filtering
            return await this.userMessageDetailsDAO.getMessagesBetweenUsers(
                requestingUserId,
                partnerUserId,
                {...options, requestingUserId} // Ensure requestingUserId is passed for filtering deleted messages
            );
        } catch (error) {
            console.error(`[ChatService] Error fetching messages between ${requestingUserId} and ${partnerUserId}:`, error);
            throw new InternalServerError('Could not retrieve messages.');
        }
    }

    /**
     * Creates a new message, saves it, and emits an event for real-time delivery.
     * @param {string} senderUserId - The ID of the message sender.
     * @param {string} recipientUserId - The ID of the message recipient.
     * @param {string} body - The message content.
     * @returns {Promise<import('#models/user-message-details.model').UserMessageDetails>} - The created message with full sender/recipient details.
     */
    async sendMessage(senderUserId, recipientUserId, body) {
        if (!senderUserId || !recipientUserId || !body) {
            throw new BadRequestError('Sender ID, Recipient ID, and message body are required.');
        }
        if (senderUserId === recipientUserId) {
            throw new BadRequestError('Sender and recipient cannot be the same user.');
        }

        // Validate recipient exists and is active
        const recipientUser = await this.registeredUserDAO.getById(recipientUserId);
        if (!recipientUser) {
            throw new NotFoundError(`Recipient user with ID ${recipientUserId} not found.`);
        }

        if (recipientUser.status !== 'active') {
            throw new ForbiddenError(`Cannot send message to user with status: ${recipientUser.status}.`);
        }

        try {
            // 1. Create Message model instance (only essential fields for creation)
            const newMessage = new Message(
                null,
                null,
                senderUserId,
                recipientUserId,
                body,
                MessageTypeEnum.DIRECT
            );

            // 2. Save the message using the base MessageDAO
            const createdMessage = await this.messageDAO.create(newMessage);
            if (!createdMessage || !createdMessage.messageId) {
                throw new InternalServerError('Failed to save message or retrieve its ID.');
            }

            // 3. Fetch the *detailed* view of the newly created message
            const detailedCreatedMessage = await this.userMessageDetailsDAO.getByMessageId(createdMessage.messageId);
            if (!detailedCreatedMessage) {
                // Should not happen if creation succeeded, but handle defensively
                console.error(`[ChatService] CRITICAL: Could not fetch details for just-created message ${createdMessage.messageId}`);
                throw new InternalServerError('Failed to retrieve created message details.');
            }

            // 4. Emit event for the chat listener to send via WebSocket
            this.eventBus.emit('chat.message.created', {
                recipientUserId: recipientUserId,
                message: detailedCreatedMessage // Send the rich message object
            });
            console.log(`[ChatService] Emitted 'chat.message.created' for recipient ${recipientUserId}`);

            console.log(`[ChatService] detailedCreatedMessage:`, detailedCreatedMessage);
            // 5. Return the detailed message to the controller
            return detailedCreatedMessage;

        } catch (error) {
            console.error(`[ChatService] Error sending message from ${senderUserId} to ${recipientUserId}:`, error);
            // Re-throw specific errors or a generic internal error
            if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ForbiddenError) {
                throw error;
            }
            throw new InternalServerError('Could not send message.');
        }
    }

    /**
     * Marks messages sent by partnerUserId to requestingUserId as read.
     * @param {string} requestingUserId - The user who is reading the messages (the recipient).
     * @param {string} partnerUserId - The user who sent the messages.
     * @returns {Promise<void>}
     */
    async markMessagesAsRead(requestingUserId, partnerUserId) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Both requesting user ID and partner user ID are required.');
        }

        // Validate partner exists (optional, but good practice)
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }

        try {
            // 1. Find unread message IDs directly from the Message table
            const unreadMessages = await this.messageDAO.getUnreadMessages(partnerUserId, requestingUserId);

            const messageIdsToUpdate = unreadMessages.map(msg => msg.messageId);

            if (messageIdsToUpdate.length > 0) {
                // 2. Call DAO method to update the status
                const updatedCount = await this.messageDAO.markAsRead(messageIdsToUpdate, requestingUserId);
                console.log(`[ChatService] Marked ${updatedCount} messages as read for user ${requestingUserId} from partner ${partnerUserId}.`);

                // 3. Optional: Emit an event if the sender needs real-time notification of read status
                // this.eventBus.emit('chat.messages.read', {
                //    readerId: requestingUserId,
                //    partnerId: partnerUserId,
                //    messageIds: messageIdsToUpdate // Send IDs or just counts? Depends on frontend need.
                // });
            } else {
                console.log(`[ChatService] No unread messages found for user ${requestingUserId} from partner ${partnerUserId}.`);
            }

        } catch (error) {
            console.error(`[ChatService] Error marking messages as read for ${requestingUserId} from ${partnerUserId}:`, error);
            throw new InternalServerError('Could not mark messages as read.');
        }
    }
}

// Export an instance, injecting DAO dependencies and EventBus
export default new ChatService(
    MessageDAO,
    UserMessageDetailsDAO,
    RegisteredUserDAO,
    EventBus
);