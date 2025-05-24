// backend/daos/message.dao.js
import {postgresInstance} from '#configs/postgres.config.js';
import Message from '#models/message.model.js';

/**
 * @typedef {import('../models/message.model.js').MessageTypeEnum} MessageTypeEnum
 * // Assuming UserStatus might be defined elsewhere, e.g., in a user model.
 * // For this example, we'll describe it inline if not available for import.
 * // For instance: typedef {import('../models/user.model.js').UserStatus} UserStatus
 */

/**
 * @typedef {Object} GetMessagesOptions
 * @property {number} [limit=50] - Max number of messages to return.
 * @property {number} [offset=0] - Number of messages to skip.
 * @property {'asc'|'desc'} [order='desc'] - Sort order by createdAt. Default is desc (newest first).
 */

/**
 * @typedef {object} LastMessageDetailsPreview
 * @property {string | null} text - The body text of the last message.
 * @property {Date | null} timestamp - The timestamp of the last message.
 * @property {string | null} senderPrincipalId - The Principal UUID of who sent the last message.
 * @property {boolean} isRead - If the last message was read by its recipient (true if read, false otherwise).
 */

/**
 * @typedef {object} ConversationPartnerPreview
 * @property {string} partnerPrincipalId - The Principal UUID of the conversation partner.
 * @property {string | null} partnerDisplayName - The display name of the partner.
 * @property {string | null} partnerUsername - The username of the partner.
 * @property {string | null} partnerAvatar - The avatar URL of the partner.
 * @property {('active'|'suspended'|'banned') | null} partnerStatus - The status of the partner (from RegisteredUser table), null if not applicable or not a registered user.
 * @property {number} unreadCount - The number of unread messages from this partner to the user.
 * @property {LastMessageDetailsPreview | null} lastMessage - Details of the last message exchanged.
 */


/**
 * DAO for interacting with the base "Message" table.
 */
class MessageDAO {
    constructor() {
        this.tableName = 'Message';
    }

    /**
     * Creates a new message record in the database.
     * @param {Message} message - The Message instance to create (messageId, createdAt are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message>} The newly created Message instance with DB-generated values.
     */
    async create(message, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {messageId, createdAt, ...insertData} = message;

        if (!insertData.senderPrincipalId || !insertData.recipientPrincipalId || !insertData.body) {
            throw new Error('[MessageDAO] Missing required fields: senderPrincipalId, recipientPrincipalId, body.');
        }

        try {
            const insertedRows = await queryBuilder(this.tableName)
                .insert(insertData)
                .returning('*');

            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('Message creation in DAO failed: No data returned.');
            }
            return Message.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[MessageDAO] Error creating message:', error);
            throw error;
        }
    }

    /**
     * Fetches a single message by its ID.
     * @param {string} messageId - The UUID of the message.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message | null>} The Message instance or null if not found.
     */
    async getById(messageId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!messageId) {
            console.warn('[MessageDAO] getById called without messageId');
            return null;
        }
        try {
            const row = await queryBuilder(this.tableName)
                .where({messageId})
                .first();
            return Message.fromDbRow(row);
        } catch (error) {
            console.error(`[MessageDAO] Error finding message by ID (${messageId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches unread messages sent *by* senderPrincipalId *to* recipientPrincipalId.
     * @param {string} senderPrincipalId - The Principal UUID of the message sender.
     * @param {string} recipientPrincipalId - The Principal UUID of the message recipient.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Message[]>} An array of unread Message instances.
     */
    async getUnreadMessages(senderPrincipalId, recipientPrincipalId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!senderPrincipalId || !recipientPrincipalId) {
            console.error('[MessageDAO:getUnreadMessages] Requires both senderPrincipalId and recipientPrincipalId.');
            return [];
        }

        try {
            const rows = await queryBuilder(this.tableName)
                .select('*')
                .where({
                    senderPrincipalId: senderPrincipalId,
                    recipientPrincipalId: recipientPrincipalId,
                    isRead: false,
                    recipientDeleted: false
                })
                .orderBy('createdAt', 'asc');
            return rows.map(Message.fromDbRow);
        } catch (error) {
            console.error(`[MessageDAO] Error fetching unread messages from ${senderPrincipalId} to ${recipientPrincipalId}:`, error);
            throw error;
        }
    }

    /**
     * Marks multiple messages as read for a specific recipient.
     * @param {string[]} messageIds - An array of message UUIDs to mark as read.
     * @param {string} recipientPrincipalId - The Principal UUID of the recipient whose messages are being marked.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of messages updated.
     */
    async markAsRead(messageIds, recipientPrincipalId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        if (!messageIds || messageIds.length === 0 || !recipientPrincipalId) {
            console.warn('[MessageDAO:markAsRead] Missing messageIds or recipientPrincipalId.');
            return 0;
        }
        try {
            return await queryBuilder(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({recipientPrincipalId: recipientPrincipalId})
                .andWhere({isRead: false})
                .update({isRead: true});
        } catch (error) {
            console.error('[MessageDAO] Error marking messages as read:', error);
            throw error;
        }
    }

    /**
     * Soft deletes messages for a specific principal (either sender or recipient).
     * @param {string[]} messageIds - An array of message UUIDs to mark as deleted.
     * @param {string} deletingPrincipalId - The Principal UUID of the user deleting the messages.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<{senderDeletedCount: number, recipientDeletedCount: number}>} Count of messages marked deleted.
     */
    async markAsDeleted(messageIds, deletingPrincipalId, trx = null) {
        if (!messageIds || messageIds.length === 0 || !deletingPrincipalId) {
            console.warn('[MessageDAO:markAsDeleted] Missing messageIds or deletingPrincipalId.');
            return {senderDeletedCount: 0, recipientDeletedCount: 0};
        }

        let senderDeletedCount = 0;
        let recipientDeletedCount = 0;

        try {
            const db = trx || postgresInstance;

            senderDeletedCount = await db(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({senderPrincipalId: deletingPrincipalId})
                .update({senderDeleted: true});

            recipientDeletedCount = await db(this.tableName)
                .whereIn('messageId', messageIds)
                .andWhere({recipientPrincipalId: deletingPrincipalId})
                .update({recipientDeleted: true});

            return {senderDeletedCount, recipientDeletedCount};

        } catch (error) {
            console.error(`[MessageDAO] Error soft deleting messages for principal (${deletingPrincipalId}):`, error);
            throw error;
        }
    }

    /**
     * Fetches a preview list of conversation partners for a given user.
     * IMPORTANT: The 'currentUserPrincipalId' parameter is the Principal ID of the user making the request.
     *
     * @param {string} currentUserPrincipalId - The Principal UUID of the user whose conversation partners to fetch.
     * @param {object} [options={}] - Options (limit, offset, order). Order applies to last interaction time.
     * @param {number} [options.limit=50] - Max number of conversation partners to return.
     * @param {number} [options.offset=0] - Number of conversation partners to skip.
     * @param {'asc' | 'desc'} [options.order='desc'] - Order of conversations by last message time.
     * @returns {Promise<ConversationPartnerPreview[]>} - An array of objects containing partner details and last message preview.
     * @throws {Error} If there's a database query issue.
     */
    async getConversationPartnersPreviewData(currentUserPrincipalId, options = {}) {
        if (!currentUserPrincipalId) {
            console.warn('[MessageDAO:getConversationPartnersPreviewData] Requires a currentUserPrincipalId.');
            throw new Error('currentUserPrincipalId is required for getConversationPartnersPreviewData');
        }

        const {limit = 50, offset = 0, order = 'desc'} = options;
        const validOrder = ['asc', 'desc'].includes(order?.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            const partnersCTE = 'PartnersCTE';
            const partnersQuery = postgresInstance(this.tableName)
                .distinct('senderPrincipalId as partnerId')
                .where('recipientPrincipalId', currentUserPrincipalId)
                .andWhere('recipientDeleted', false)
                .union((qb) => {
                    qb.distinct('recipientPrincipalId as partnerId')
                        .from(this.tableName)
                        .where('senderPrincipalId', currentUserPrincipalId)
                        .andWhere('senderDeleted', false);
                }, true);

            const latestInteractionCTE = 'LatestInteractionCTE';
            const latestInteractionQuery = postgresInstance(this.tableName)
                .select(postgresInstance.raw(`
                CASE
                    WHEN "senderPrincipalId" = ? THEN "recipientPrincipalId"
                    ELSE "senderPrincipalId"
                END AS "partnerId"
            `, [currentUserPrincipalId]))
                .max('createdAt as lastMessageTime')
                .where(function () {
                    this.where(function () {
                        this.where('recipientPrincipalId', currentUserPrincipalId).andWhere('recipientDeleted', false);
                    }).orWhere(function () {
                        this.where('senderPrincipalId', currentUserPrincipalId).andWhere('senderDeleted', false);
                    });
                })
                .groupBy('partnerId');

            const results = await postgresInstance
                .with(partnersCTE, partnersQuery)
                .with(latestInteractionCTE, latestInteractionQuery)
                .select(
                    'pCTE.partnerId',
                    'prof.displayName as partnerDisplayName',
                    'acc.username as partnerUsername',
                    'media_avatar.url as partnerAvatar',
                    'ru.status as partnerStatus', // <<< --- ADDED partnerStatus selection
                    postgresInstance(this.tableName + ' as m_unread')
                        .count('*')
                        .where('m_unread.senderPrincipalId', postgresInstance.ref('pCTE.partnerId'))
                        .andWhere('m_unread.recipientPrincipalId', currentUserPrincipalId)
                        .andWhere('m_unread.isRead', false)
                        .andWhere('m_unread.recipientDeleted', false)
                        .as('unreadCount'),
                    'liCTE.lastMessageTime',
                    postgresInstance(this.tableName + ' as m_snippet')
                        .select(postgresInstance.raw(`json_build_object(
                        'body', body,
                        'senderPrincipalId', "senderPrincipalId",
                        'isRead', "isRead",
                        'createdAt', "createdAt"
                    )::text`))
                        .where(function () {
                            this.where(builder => builder.where('m_snippet.senderPrincipalId', currentUserPrincipalId).andWhere('m_snippet.recipientPrincipalId', postgresInstance.ref('pCTE.partnerId')))
                                .orWhere(builder => builder.where('m_snippet.senderPrincipalId', postgresInstance.ref('pCTE.partnerId')).andWhere('m_snippet.recipientPrincipalId', currentUserPrincipalId));
                        })
                        .andWhere(function () {
                            this.where(function () {
                                this.where('m_snippet.senderPrincipalId', currentUserPrincipalId).andWhere('m_snippet.senderDeleted', false);
                            })
                                .orWhere(function () {
                                    this.where('m_snippet.recipientPrincipalId', currentUserPrincipalId).andWhere('m_snippet.recipientDeleted', false);
                                });
                        })
                        .orderBy('m_snippet.createdAt', 'desc')
                        .limit(1)
                        .as('lastMessageDetailsJson')
                )
                .from(`${partnersCTE} as pCTE`)
                .innerJoin(`${latestInteractionCTE} as liCTE`, 'pCTE.partnerId', 'liCTE.partnerId')
                .leftJoin('Principal as p', 'pCTE.partnerId', 'p.principalId')
                .leftJoin('Profile as prof', 'p.profileId', 'prof.profileId')
                .leftJoin('Account as acc', 'p.accountId', 'acc.accountId')
                .leftJoin('Media as media_avatar', 'prof.avatar', 'media_avatar.mediaId')
                .leftJoin('RegisteredUser as ru', 'p.principalId', 'ru.principalId') // <<< --- ADDED JOIN with RegisteredUser
                .whereNotNull('pCTE.partnerId')
                .orderBy('liCTE.lastMessageTime', validOrder)
                .limit(limit)
                .offset(offset);

            return results.map(row => {
                let lastMessage = null;
                if (row.lastMessageDetailsJson) {
                    try {
                        const details = JSON.parse(row.lastMessageDetailsJson);
                        lastMessage = {
                            text: details.body,
                            timestamp: details.createdAt ? new Date(details.createdAt) : null, // Use createdAt from JSON
                            senderPrincipalId: details.senderPrincipalId,
                            isRead: !!details.isRead
                        };
                    } catch (e) {
                        console.error(`[MessageDAO] Error parsing last message details JSON for partner ${row.partnerId}:`, e, "JSON:", row.lastMessageDetailsJson);
                    }
                }

                return {
                    partnerPrincipalId: row.partnerId,
                    partnerDisplayName: row.partnerDisplayName,
                    partnerUsername: row.partnerUsername,
                    partnerAvatar: row.partnerAvatar,
                    partnerStatus: row.partnerStatus,
                    unreadCount: parseInt(row.unreadCount, 10) || 0,
                    lastMessage: lastMessage
                };
            });

        } catch (error) {
            console.error(`[MessageDAO] Error fetching conversation partners preview for user (PrincipalId: ${currentUserPrincipalId}):`, error);
            throw new Error('Failed to retrieve conversation partners from database.');
        }
    }
}

export default new MessageDAO();