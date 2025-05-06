// backend/services/chat.service.js
import MessageDAO from '#daos/message.dao.js';
import UserMessageDetailsDAO from '#daos/user-message-details.dao.js';
import RegisteredUserDAO from '#daos/registered-user.dao.js';
import Message, {MessageTypeEnum} from '#models/message.model.js';
import EventBus from '#core/event-bus.js';
import {AppError, BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from '#errors/AppError.js';
import {postgresInstance} from "#db/postgres.js";

class ChatService {
    /**
     * Constructor for ChatService.
     * @param {MessageDAO} messageDao - DAO for base message operations.
     * @param {UserMessageDetailsDAO} userMessageDetailsDao - DAO for the user message details view/object.
     * @param {RegisteredUserDAO} registeredUserDao - DAO for registered users.
     * @param {EventBus} eventBus - System event bus.
     */
    constructor(messageDao, userMessageDetailsDao, registeredUserDao, eventBus) {
        this.messageDAO = messageDao;
        this.userMessageDetailsDAO = userMessageDetailsDao;
        this.registeredUserDAO = registeredUserDao;
        this.eventBus = eventBus;
    }

    /**
     * Retrieves the list of conversation partners (with latest message details) for a user.
     * @param {string} userId - The ID of the user whose conversations to fetch.
     * @param {object} [options={}] - Pagination/filtering options (e.g., { limit, offset }).
     * @returns {Promise<Array<ConversationPartnerPreview>>} - List of partner preview objects.
     * @throws {BadRequestError} If userId is missing.
     * @throws {InternalServerError} For database errors.
     */
    async getConversationPartnersPreviewData(userId, options = {}) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch conversations.');
        }
        const userExists = await this.registeredUserDAO.getById(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found.`);
        }
        try {
            return await this.messageDAO.getConversationPartnersPreviewData(userId, options);
        } catch (error) {
            console.error(`[ChatService:getConversationPartnersPreviewData] Error for user ${userId}:`, error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError('Could not retrieve conversation list.');
        }
    }

    /**
     * Retrieves the message history between two users.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} partnerUserId - The ID of the other user in the conversation.
     * @param {object} [options={}] - Pagination/filtering options (e.g., { limit, offset }).
     * @returns {Promise<Array<UserMessageDetails>>} - Array of detailed messages.
     * @throws {BadRequestError} If required IDs are missing or user tries to chat with self.
     * @throws {NotFoundError} If the partner user doesn't exist.
     * @throws {ForbiddenError} If fetching messages from the partner is disallowed (e.g., banned/blocked user).
     * @throws {InternalServerError} For database errors.
     */
    async getMessages(requestingUserId, partnerUserId, options = {}) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Requesting user ID and partner user ID are required.');
        }
        if (requestingUserId === partnerUserId) {
            throw new BadRequestError('Cannot fetch messages with yourself.');
        }

        // Validate partner exists and is accessible
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }
        if (partnerUser.status !== 'active') { // Example status check
            throw new ForbiddenError(`Cannot retrieve messages involving user with status: ${partnerUser.status}.`);
        }
        // TODO: Add block check if implementing user blocking

        // Sanitize options
        const queryOptions = {
            limit: Math.max(1, parseInt(options.limit, 10) || 50),
            offset: Math.max(0, parseInt(options.offset, 10) || 0),
            order: ['asc', 'desc'].includes(options.order?.toLowerCase()) ? options.order.toLowerCase() : 'desc', // Default to newest first
            requestingUserId: requestingUserId // Crucial for filtering deleted messages
        };

        try {
            // Use the DAO for fetching detailed messages view/object
            return await this.userMessageDetailsDAO.getMessagesBetweenUsers(
                requestingUserId,
                partnerUserId,
                queryOptions
            );
        } catch (error) {
            console.error(`[ChatService:getMessages] Error between ${requestingUserId} and ${partnerUserId}:`, error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError('Could not retrieve messages.');
        }
    }

    /**
     * Creates a new message, saves it, fetches its detailed view, and emits an event.
     * @param {string} senderUserId - The ID of the message sender.
     * @param {string} recipientUserId - The ID of the message recipient.
     * @param {string} body - The message content (trimmed).
     * @returns {Promise<UserMessageDetails>} - The created message with full sender/recipient details.
     * @throws {BadRequestError} If validation fails (missing fields, same user, empty body).
     * @throws {NotFoundError} If the recipient user doesn't exist.
     * @throws {ForbiddenError} If sending to the recipient is disallowed.
     * @throws {InternalServerError} For database or unexpected errors.
     */
    async sendMessage(senderUserId, recipientUserId, body) {
        const trimmedBody = body?.trim(); // Trim body early
        if (!senderUserId || !recipientUserId || !trimmedBody) {
            throw new BadRequestError('Sender ID, Recipient ID, and non-empty message body are required.');
        }
        if (senderUserId === recipientUserId) {
            throw new BadRequestError('Cannot send a message to yourself.');
        }

        // Validate recipient existence and status
        const recipientUser = await this.registeredUserDAO.getById(recipientUserId);
        if (!recipientUser) {
            throw new NotFoundError(`Recipient user with ID ${recipientUserId} not found.`);
        }
        if (recipientUser.status !== 'active') { // Example check
            throw new ForbiddenError(`Cannot send message to user with status: ${recipientUser.status}.`);
        }
        // TODO: Add block check

        let savedMessage;
        try {
            // Save within a transaction (optional but good for potential related updates)
            savedMessage = await postgresInstance.transaction(async (trx) => {
                const newMessage = new Message(
                    null, null, senderUserId, recipientUserId, trimmedBody, MessageTypeEnum.DIRECT
                );
                return await this.messageDAO.create(newMessage, trx);
            });

            if (!savedMessage?.messageId) {
                throw new InternalServerError('Failed to save message or retrieve its ID.');
            }

            // Fetch the detailed view *after* transaction commits
            const detailedCreatedMessage = await this.userMessageDetailsDAO.getByMessageId(savedMessage.messageId);
            if (!detailedCreatedMessage) {
                console.error(`[ChatService:sendMessage] CRITICAL: Could not fetch details for just-created message ${savedMessage.messageId}.`);
                throw new InternalServerError('Failed to retrieve created message details after saving.');
            }

            // Emit event for real-time delivery
            this.eventBus.emit('chat.message.created', {
                recipientUserId: recipientUserId,
                message: detailedCreatedMessage // Send the rich object
            });

            return detailedCreatedMessage; // Return the detailed message

        } catch (error) {
            console.error(`[ChatService:sendMessage] Error from ${senderUserId} to ${recipientUserId}:`, error);
            if (error instanceof AppError) throw error;
            throw new InternalServerError('Could not send message due to a server error.');
        }
    }

    /**
     * Marks messages sent by a partner as read by the requesting user.
     * @param {string} requestingUserId - The user who is reading the messages (the recipient).
     * @param {string} partnerUserId - The user who sent the messages.
     * @returns {Promise<number>} The number of messages marked as read.
     * @throws {BadRequestError} If required IDs are missing or user tries to read self messages.
     * @throws {NotFoundError} If the partner user doesn't exist.
     * @throws {InternalServerError} For database errors.
     */
    async markMessagesAsRead(requestingUserId, partnerUserId) {
        if (!requestingUserId || !partnerUserId) {
            throw new BadRequestError('Requesting user ID and partner user ID are required.');
        }
        if (requestingUserId === partnerUserId) {
            // Reading own messages doesn't make sense in this context
            return 0;
        }

        // Optional: Validate partner exists
        const partnerUser = await this.registeredUserDAO.getById(partnerUserId);
        if (!partnerUser) {
            throw new NotFoundError(`User with ID ${partnerUserId} not found.`);
        }

        try {
            // Use transaction for atomicity of find + update (optional but safer)
            const updatedCount = await postgresInstance.transaction(async (trx) => {
                // 1. Find unread message IDs from partner to user
                const unreadMessages = await this.messageDAO.getUnreadMessages(partnerUserId, requestingUserId, trx);
                const messageIdsToUpdate = unreadMessages.map(msg => msg.messageId);

                if (messageIdsToUpdate.length === 0) {
                    return 0; // No messages to mark
                }

                // 2. Mark them as read using the DAO
                return await this.messageDAO.markAsRead(messageIdsToUpdate, requestingUserId, trx);
            }); // Commit transaction

            // Emit event *after* successful commit
            if (updatedCount > 0) {
                this.eventBus.emit('chat.messages.read', {
                    readerUserId: requestingUserId,
                    senderUserId: partnerUserId, // The partner whose messages were read
                    count: updatedCount
                });
            }
            return updatedCount;

        } catch (error) {
            console.error(`[ChatService:markMessagesAsRead] Error for reader ${requestingUserId} from partner ${partnerUserId}:`, error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError('Could not mark messages as read.');
        }
    }
}

// Inject dependencies
export default new ChatService(
    MessageDAO,
    UserMessageDetailsDAO,
    RegisteredUserDAO,
    EventBus
);