import {sendApiRequest} from "#utils/apiClient";

// No need to import types here unless using JSDoc more heavily

class ChatService {
    /**
     * Fetches the list of conversation partners for the current user.
     * @returns {Promise<Array<object>>} - Array of conversation partner objects.
     */
    async getConversationPartners() {
        try {
            const response = await sendApiRequest('/api/chats/partners', {method: 'GET'});
            if (response.success && Array.isArray(response.data)) {
                return response.data;
            }
            console.warn("Unexpected response structure for getConversationPartnersPreviewData:", response);
            return [];
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    }

    /**
     * Fetches messages for a specific chat partner.
     * @param {string} partnerUserId - The ID of the other user in the conversation.
     * @returns {Promise<Array<object>>} - Array of message objects.
     */
    async getMessages(partnerUserId) {
        if (!partnerUserId) {
            console.warn("getMessages called without partnerUserId");
            return [];
        }
        try {
            const url = `/api/chats/${encodeURIComponent(partnerUserId)}/messages`;
            const response = await sendApiRequest(url, {method: 'GET'});
            if (response.success && Array.isArray(response.data)) {
                return response.data;
            }
            console.warn(`Unexpected response structure for getMessages(${partnerUserId}):`, response);
            return [];
        } catch (error) {
            console.error(`Error fetching messages for partner ${partnerUserId}:`, error);
            return [];
        }
    }

    /**
     * Sends a new direct message.
     * @param {string} recipientUserId - The ID of the user receiving the message.
     * @param {string} body - The message content.
     * @returns {Promise<object | null>} - The created message object or null on failure.
     */
    async sendMessage(recipientUserId, body) {
        if (!recipientUserId || !body) {
            console.error("sendMessage requires recipientUserId and body.");
            throw new Error("Recipient and message body are required.");
        }
        try {
            const response = await sendApiRequest('/api/chats/messages', {
                method: 'POST',
                body: {recipientUserId, body},
            });
            if (response.success && response.data?.message) {
                return response.data.message;
            }
            console.error("Failed to send message or invalid response:", response);
            throw new Error(response.message || "Failed to send message.");
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    async markMessagesAsRead(partnerUserId) {
        if (!partnerUserId) {
            console.warn("markMessagesAsRead called without partnerUserId");
            return false;
        }
        try {
            const url = `/api/chats/${encodeURIComponent(partnerUserId)}/messages/read`;
            const response = await sendApiRequest(url, {method: 'POST'});
            return response.success;
        } catch (error) {
            console.error(`Error marking messages as read for partner ${partnerUserId}:`, error);
            return false;
        }
    }
}

export default new ChatService();