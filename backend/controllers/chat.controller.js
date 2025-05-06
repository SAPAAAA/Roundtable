// backend/controllers/chat.controller.js
import HTTP_STATUS from '#constants/httpStatus.js';
import ChatService from '#services/chat.service.js'; // Use the injected instance name from below
import {BadRequestError, ForbiddenError, InternalServerError, NotFoundError} from '#errors/AppError.js';

class ChatController {
    /**
     * @param {ChatService} injectedChatService
     */
    constructor(injectedChatService) {
        this.chatService = injectedChatService;
    }

    /**
     * Handles GET /chats/partners
     * Retrieves the list of conversation partners preview for the logged-in user.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getConversationPartnersPreview = async (req, res) => {
        const {userId} = req.session; // Assumes isAuthenticated middleware adds userId

        // Middleware should handle this, but double-check
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }

        try {
            // Options can be parsed from req.query if needed for pagination/sorting partners
            const options = {
                limit: req.query.limit,
                offset: req.query.offset
                // order: req.query.order // Example
            };
            const conversationPartners = await this.chatService.getConversationPartnersPreviewData(userId, options);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: conversationPartners,
            });
        } catch (error) {
            console.error(`[ChatController:getConversationPartnersPreview] Error for userId ${userId}:`, error.message);
            if (error instanceof BadRequestError) { // e.g., invalid options from service
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            // Fallback for unexpected errors
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while fetching conversations.'
            });
        }
    }

    /**
     * Handles GET /chats/:partnerUserId/messages
     * Retrieves message history between the logged-in user and a specific partner.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getMessages = async (req, res) => {
        const {userId} = req.session;
        const {partnerUserId} = req.params;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        // Basic check for partnerId presence, service does more validation
        if (!partnerUserId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Partner user ID is required.'});
        }

        try {
            // Parse query parameters for pagination/filtering
            const options = {
                limit: req.query.limit,
                offset: req.query.offset,
                order: req.query.order // Example, service validates/defaults
            };
            const messages = await this.chatService.getMessages(userId, partnerUserId, options);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: messages,
            });
        } catch (error) {
            console.error(`[ChatController:getMessages] Error between ${userId} and ${partnerUserId}:`, error.message);
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof NotFoundError) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof ForbiddenError) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while fetching messages.'
            });
        }
    }

    /**
     * Handles POST /chats/messages
     * Sends a new message from the logged-in user to a recipient.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    sendMessage = async (req, res) => {
        const {userId} = req.session; // Sender is the logged-in user
        const {recipientUserId, body} = req.body;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        // Basic validation, service does more thorough checks
        if (!recipientUserId || !body) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Recipient user ID and message body are required.'
            });
        }

        try {
            // Service handles trimming body, checking recipient status/blocks, saving, and emitting event
            const createdMessage = await this.chatService.sendMessage(userId, recipientUserId, body);

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "Message sent successfully.",
                data: {message: createdMessage} // Return the detailed created message
            });
        } catch (error) {
            console.error(`[ChatController:sendMessage] Error from ${userId} to ${recipientUserId}:`, error.message);
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof NotFoundError) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof ForbiddenError) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while sending the message.'
            });
        }
    }

    /**
     * Handles POST /chats/:partnerUserId/messages/read
     * Marks messages from a partner as read by the authenticated user.
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    markMessagesAsRead = async (req, res) => {
        const {userId} = req.session;
        const {partnerUserId} = req.params; // ID of the *other* user in the chat

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        if (!partnerUserId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Partner user ID is required.'});
        }

        try {
            const count = await this.chatService.markMessagesAsRead(userId, partnerUserId);
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `Marked ${count} message(s) as read.`,
                data: {count: count}
            });
        } catch (error) {
            console.error(`[ChatController:markMessagesAsRead] Error for reader ${userId} from partner ${partnerUserId}:`, error.message);
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof NotFoundError) { // Partner user not found
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while marking messages as read.'
            });
        }
    }
}

// Inject the service instance
export default new ChatController(ChatService);