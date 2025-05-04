// backend/controllers/chat.controller.js
import HTTP_STATUS from '#constants/httpStatus.js';
import ChatService from '#services/chat.service.js'; // Assuming you create this service
import {BadRequestError, InternalServerError, NotFoundError} from '#errors/AppError.js';

class ChatController {
    constructor(injectedChatService) {
        this.chatService = injectedChatService;
    }

    /**
     * Handles GET /api/chats
     * Retrieves the list of conversation partners for the logged-in user.
     */
    getConversationPartnersPreview = async (req, res, next) => {
        const {userId} = req.session; // Assumes isAuthenticated middleware adds userId

        // Basic check (should be guaranteed by middleware, but good practice)
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        try {
            console.log(`[ChatController] Fetching conversations for userId: ${userId}`);
            // Call the service layer to get the list of partners
            const conversationPartners = await this.chatService.getConversationPartnersPreviewData(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: conversationPartners, // Send the array of partners
            });

        } catch (error) {
            console.error(`[ChatController] Error fetching conversations for userId ${userId}:`, error);
            // Pass error to central error handler or handle specific known errors
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error.message || 'Failed to fetch conversations.'
                });
            }
            // Fallback for other unexpected errors
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while fetching conversations.'
            });
            // next(error); // Alternatively, pass to a central error handler
        }
    }

    /**
     * Handles GET /api/chats/:partnerUserId/messages
     * Retrieves message history between the logged-in user and a specific partner.
     */
    getMessages = async (req, res, next) => {
        const {userId} = req.session;
        const {partnerUserId} = req.params;

        // Validate input
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        if (!partnerUserId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: 'Partner user ID is required.'});
        }

        // Parse query parameters for pagination (optional)
        const {limit = 100, offset = 0} = req.query;
        const options = {
            limit: parseInt(limit, 10) || 50,
            offset: parseInt(offset, 10) || 0,
            // Add other options like sorting if needed
        };


        try {
            console.log(`[ChatController] Fetching messages between ${userId} and ${partnerUserId} with options:`, options);
            // Call the service layer
            const messages = await this.chatService.getMessages(userId, partnerUserId, options);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: messages, // Send the array of messages
            });

        } catch (error) {
            console.error(`[ChatController] Error fetching messages between ${userId} and ${partnerUserId}:`, error);
            if (error instanceof NotFoundError) { // Example: Service throws NotFoundError if chat doesn't exist
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error.message || 'Failed to fetch messages.'
                });
            }
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while fetching messages.'
            });
            // next(error);
        }
    }

    /**
     * Handles POST /api/chats/messages
     * Sends a new message from the logged-in user to a recipient.
     */
    sendMessage = async (req, res, next) => {
        const {userId} = req.session; // Sender is the logged-in user
        const {recipientUserId, body} = req.body; // Get recipient and message body

        // Validate input
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        if (!recipientUserId || !body || typeof body !== 'string' || body.trim().length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Recipient user ID and non-empty message body are required.'
            });
        }
        if (recipientUserId === userId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot send a message to yourself.'
            });
        }


        try {
            console.log(`[ChatController] User ${userId} sending message to ${recipientUserId}`);
            // Call the service layer to save and potentially trigger WS push
            const createdMessage = await this.chatService.sendMessage(userId, recipientUserId, body.trim());

            // Respond with the created message data
            res.status(HTTP_STATUS.CREATED).json({ // Use 201 Created status
                success: true,
                message: "Message sent successfully.",
                data: {
                    message: createdMessage // Send back the created message details
                }
            });

        } catch (error) {
            console.error(`[ChatController] Error sending message from ${userId} to ${recipientUserId}:`, error);
            if (error instanceof NotFoundError) { // E.g., Recipient doesn't exist
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: error.message || 'Failed to send message.'
                });
            }
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while sending the message.'
            });
            // next(error);
        }
    }

    /**
     * Read messages between the authenticated user and another user.
     */
    markMessagesAsRead = async (req, res, next) => {
        const {userId} = req.session;
        const {partnerUserId} = req.params; // ID of the *other* user in the chat

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({success: false, message: 'Authentication required.'});
        }
        if (!partnerUserId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Partner user ID is required to read messages.'
            });
        }
        try {
            const messages = await ChatService.markMessagesAsRead(userId, partnerUserId);
            return res.status(HTTP_STATUS.OK).json({success: true, messages});
        } catch (error) {
            console.error(`[ChatController] Error reading messages for user ${userId} from partner ${partnerUserId}:`, error);
            // Handle errors appropriately
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve messages.'
            });
            // next(error);
        }
    }


}

export default new ChatController(ChatService);