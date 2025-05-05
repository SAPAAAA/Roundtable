// backend/services/chatService.js

// --- Imports ---
import MessageDAO from '#daos/message.dao.js';
import UserMessageDetailsDAO from '#daos/user-message-details.dao.js';
import RegisteredUserDAO from '#daos/registered-user.dao.js';
import Message, {MessageTypeEnum} from '#models/message.model.js';
import EventBus from '#core/event-bus.js';
import {BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from '#errors/AppError.js';
import {postgresInstance} from "#db/postgres.js";

class ChatService {
    /**
     * Constructor for ChatService.
     * @param {object} msgDAO - Data Access Object for messages.
     * @param {object} userMsgDetailsDAO - DAO for the user_message_details view/query.
     * @param {object} regUserDAO - DAO for registered users.
     */
    constructor(msgDAO, userMsgDetailsDAO, regUserDAO) {
        // Store injected dependencies as instance properties
        this.messageDAO = msgDAO;
        this.userMessageDetailsDAO = userMsgDetailsDAO;
        this.registeredUserDAO = regUserDAO;
        this.eventBus = EventBus;
    }

    /**
     * Retrieves the list of conversation partners (with latest message details) for a user.
     * @param {string} userId - The ID of the user whose conversations to fetch.
     * @returns {Promise<Array<object>>} - List of latest message details per partner, likely from a specific view or query.
     * @throws {BadRequestError} If userId is missing.
     * @throws {InternalServerError} For database errors.
     */
    async getConversationPartnersPreviewData(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch conversations.');
        }
        try {
            // Use the injected DAO
            // Assumes messageDAO has a method optimized for fetching conversation previews
            return await this.messageDAO.getConversationPartnersPreviewData(userId);
        } catch (error) {
            console.error(`[ChatService] Error fetching conversations for user ${userId}:`, error);
            throw new InternalServerError('Could not retrieve conversation list.');
        }
    }

    /**
     * Retrieves the message history between two users.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} partnerUserId - The ID of the other user in the conversation.
     * @param {object} [options={}] - Pagination/filtering options (e.g., { limit, beforeMessageId }).
     * @returns {Promise<Array<object>>} - Array of detailed messages (likely from user_message_details view).
     * @throws {BadRequestError} If required IDs are missing.
     * @throws {NotFoundError} If the partner user doesn't exist.
     * @throws {ForbiddenError} If fetching messages from the partner is disallowed (e.g., banned user).
     * @throws {InternalServerError} For database errors.
     */
    async getMessages(requestingUserId, partnerUserId, options = {}) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Both requesting user ID and partner user ID are required.');
        }

        // Use injected DAO to validate partner user
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }
        // Example check based on user status
        if (partnerUser.status === 'banned') { // Adjust status values as needed
            throw new ForbiddenError(`Cannot retrieve messages involving a banned user.`);
        }

        try {
            // Use the injected DAO for fetching detailed messages
            // Pass requestingUserId to the options for potential filtering of deleted messages in the DAO layer
            return await this.userMessageDetailsDAO.getLatestMessagesBetweenUsers(
                requestingUserId,
                partnerUserId,
                {...options, requestingUserId}
            );
        } catch (error) {
            console.error(`[ChatService] Error fetching messages between ${requestingUserId} and ${partnerUserId}:`, error);
            throw new InternalServerError('Could not retrieve messages.');
        }
    }

    /**
     * Creates a new message, saves it, fetches its detailed view, and emits an event.
     * @param {string} senderUserId - The ID of the message sender.
     * @param {string} recipientUserId - The ID of the message recipient.
     * @param {string} body - The message content.
     * @returns {Promise<object>} - The created message with full sender/recipient details (from user_message_details view).
     * @throws {BadRequestError} If validation fails (missing fields, same user).
     * @throws {NotFoundError} If the recipient user doesn't exist.
     * @throws {ForbiddenError} If sending to the recipient is disallowed (e.g., inactive user).
     * @throws {InternalServerError} For database or unexpected errors.
     */
    async sendMessage(senderUserId, recipientUserId, body) {
        // Input validation
        if (!senderUserId || !recipientUserId || !body) {
            throw new BadRequestError('Sender ID, Recipient ID, and message body are required.');
        }
        if (senderUserId === recipientUserId) {
            throw new BadRequestError('Sender and recipient cannot be the same user.');
        }

        // Use injected DAO to validate recipient user
        const recipientUser = await this.registeredUserDAO.getById(recipientUserId);
        if (!recipientUser) {
            throw new NotFoundError(`Recipient user with ID ${recipientUserId} not found.`);
        }
        // Example check for recipient status
        if (recipientUser.status !== 'active') { // Adjust status values as needed
            throw new ForbiddenError(`Cannot send message to user with status: ${recipientUser.status}.`);
        }

        try {
            // Create and save within a transaction
            const createdMessage = await postgresInstance.transaction(async (transaction) => {
                // 1. Create Message model instance
                const newMessage = new Message(
                    null, // messageId (generated)
                    null, // conversationId (can be derived/set later if needed)
                    senderUserId,
                    recipientUserId,
                    body,
                    MessageTypeEnum.DIRECT // Assuming direct messages
                );

                // 2. Save using injected base MessageDAO
                const savedMessage = await this.messageDAO.create(newMessage, transaction);
                if (!savedMessage || !savedMessage.messageId) {
                    throw new InternalServerError('Failed to save message or retrieve its ID during transaction.');
                }
                return savedMessage; // Return the basic saved message from transaction
            });

            // 3. Fetch the *detailed* view using injected UserMessageDetailsDAO *after* transaction commits
            const detailedCreatedMessage = await this.userMessageDetailsDAO.getByMessageId(createdMessage.messageId);
            if (!detailedCreatedMessage) {
                // This indicates a potential issue if the view isn't immediately updated or accessible
                console.error(`[ChatService] CRITICAL: Could not fetch details for just-created message ${createdMessage.messageId}. View consistency issue?`);
                throw new InternalServerError('Failed to retrieve created message details after saving.');
            }

            // 4. Emit event using injected EventBus for real-time delivery
            this.eventBus.emit('chat.message.created', {
                recipientUserId: recipientUserId, // Target the recipient
                message: detailedCreatedMessage // Send the rich message object
            });
            console.log(`[ChatService] Emitted 'chat.message.created' event for recipient ${recipientUserId}`);

            // 5. Return the detailed message (e.g., to the API controller)
            return detailedCreatedMessage;

        } catch (error) {
            console.error(`[ChatService] Error sending message from ${senderUserId} to ${recipientUserId}:`, error);
            // Re-throw known AppErrors, wrap others
            if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ForbiddenError) {
                throw error;
            }
            throw new InternalServerError('Could not send message due to a server error.');
        }
    }

    /**
     * Marks messages sent by a partner as read by the requesting user.
     * @param {string} requestingUserId - The user who is reading the messages (the recipient).
     * @param {string} partnerUserId - The user who sent the messages.
     * @returns {Promise<number>} The number of messages marked as read.
     * @throws {BadRequestError} If required IDs are missing.
     * @throws {NotFoundError} If the partner user doesn't exist.
     * @throws {InternalServerError} For database errors.
     */
    async markMessagesAsRead(requestingUserId, partnerUserId) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Both requesting user ID and partner user ID are required.');
        }

        // Use injected DAO to validate partner user (optional but good practice)
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }

        try {
            // Perform find and update within a transaction
            const updatedCount = await postgresInstance.transaction(async (transaction) => {
                // 1. Find unread message IDs using injected MessageDAO
                // Assumes getUnreadMessages finds messages WHERE sender=partner AND recipient=requesting AND isRead=false
                const unreadMessages = await this.messageDAO.getUnreadMessages(partnerUserId, requestingUserId, transaction); // Pass transaction

                const messageIdsToUpdate = unreadMessages.map(msg => msg.messageId);

                if (messageIdsToUpdate.length > 0) {
                    // 2. Call injected DAO method to update the status
                    // Assumes markAsRead updates messages WHERE messageId IN (...) AND recipientUserId = requestingUserId
                    const count = await this.messageDAO.markAsRead(messageIdsToUpdate, requestingUserId, transaction); // Pass transaction
                    console.log(`[ChatService] Marked ${count} messages as read in transaction for user ${requestingUserId} from partner ${partnerUserId}.`);
                    return count;
                } else {
                    console.log(`[ChatService] No unread messages found in transaction for user ${requestingUserId} from partner ${partnerUserId}.`);
                    return 0; // No messages needed marking
                }
            });

            // 3. Emit event *after* transaction commits successfully
            if (updatedCount > 0) {
                this.eventBus.emit('chat.messages.read', {
                    readerUserId: requestingUserId,
                    senderUserId: partnerUserId,
                    count: updatedCount
                });
                console.log(`[ChatService] Emitted 'chat.messages.read' event for user ${requestingUserId} from partner ${partnerUserId}.`);
            }

            return updatedCount; // Return the count of messages marked as read

        } catch (error) {
            console.error(`[ChatService] Error marking messages as read for ${requestingUserId} from ${partnerUserId}:`, error);
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError('Could not mark messages as read.');
        }
    }
}

export default new ChatService(
    MessageDAO,
    UserMessageDetailsDAO,
    RegisteredUserDAO,
    EventBus
);
