// daos/notification.dao.js
import postgres from '#db/postgres.js'; // Assuming your Knex instance is exported as default
import Notification from '#models/notification.model.js';

class NotificationDAO {
    /**
     * Finds a notification by its unique ID (UUID).
     * @param {string} notificationId - The UUID of the notification.
     * @returns {Promise<Notification | null>} The Notification instance or null if not found.
     */
    async getById(notificationId) {
        try {
            // Select the notification from the "Notification" table where notificationId matches
            const notificationRow = await postgres('Notification').where({notificationId}).first();
            // Convert the database row to a Notification model instance, or return null if not found
            return Notification.fromDbRow(notificationRow);
        } catch (error) {
            // Log any errors encountered during the database operation
            console.error(`Error finding notification by ID (${notificationId}):`, error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }

    /**
     * Creates a new notification record in the database.
     * @param {Notification} notification - The Notification instance to create (notificationId and createdAt are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Notification>} The newly created Notification instance with DB-generated values.
     */
    async create(notification, trx = null) {
        // Use the provided transaction or the default postgres connection
        const queryBuilder = trx ?? postgres;
        // Destructure the notification object, excluding fields managed by DB defaults
        const {
            notificationId, createdAt,
            ...insertData
        } = notification;

        // Basic validation: Ensure required fields are present
        if (!insertData.recipientUserId || !insertData.type) {
            throw new Error('Missing required fields for notification creation: recipientUserId and type are required.');
        }

        try {
            // Insert the notification data into the "Notification" table and return all columns of the inserted row
            const insertedRows = await queryBuilder('Notification').insert(insertData).returning('*');

            // Validate the insertion result
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Notification creation failed or did not return expected data.', insertedRows);
                throw new Error('Database error during notification creation: No data returned.');
            }
            // Convert the first returned row into a Notification model instance
            return Notification.fromDbRow(insertedRows[0]);
        } catch (error) {
            // Log any errors during creation
            console.error('Error creating notification:', error);
            // Re-throw the error
            throw error;
        }
    }

    /**
     * Updates an existing notification, primarily to mark it as read/unread.
     * @param {string} notificationId - The ID of the notification to update.
     * @param {Partial<Pick<Notification, 'isRead'>>} updateData - An object containing fields to update (currently only 'isRead').
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Notification | null>} The updated Notification instance, or null if not found.
     */
    async update(notificationId, updateData, trx = null) {
        // Use the provided transaction or the default postgres connection
        const queryBuilder = trx ?? postgres;
        // Only allow specific fields to be updated (currently just 'isRead')
        const allowedUpdates = {};
        if (updateData.isRead !== undefined) {
            allowedUpdates.isRead = updateData.isRead;
        }

        // If no valid fields to update are provided, log a warning and return the current state
        if (Object.keys(allowedUpdates).length === 0) {
            console.warn(`Notification update called for ID ${notificationId} with no valid fields to update.`);
            return this.getById(notificationId);
        }

        try {
            // Update the notification in the database where notificationId matches
            const updatedRows = await queryBuilder('Notification')
                .where({notificationId})
                .update(allowedUpdates)
                .returning('*'); // Return all columns of the updated row

            // If no rows were updated (notification not found), return null
            if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
                return null;
            }
            // Convert the first updated row into a Notification model instance
            return Notification.fromDbRow(updatedRows[0]);
        } catch (error) {
            // Log any errors during the update
            console.error(`Error updating notification (${notificationId}):`, error);
            // Re-throw the error
            throw error;
        }
    }

    /**
     * Deletes a notification by its ID (HARD delete).
     * Consider if soft deletion or TTL (time-to-live) policies are more appropriate for notifications.
     * @param {string} notificationId - The ID of the notification to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     */
    async hardDelete(notificationId, trx = null) {
        // Use the provided transaction or the default postgres connection
        const queryBuilder = trx ?? postgres;
        try {
            // Delete the notification from the "Notification" table
            const deletedCount = await queryBuilder('Notification')
                .where({notificationId})
                .del();
            // Log the result of the deletion attempt
            console.log(`Attempted HARD deletion for notificationId ${notificationId}. Rows affected: ${deletedCount}`);
            // Return the number of deleted rows
            return deletedCount;
        } catch (error) {
            // Log any errors during deletion
            console.error(`Error hard deleting notification (${notificationId}):`, error);
            // Re-throw the error
            throw error;
        }
    }

    /**
     * Finds notifications for a specific recipient account, optionally paginated, filtered, and sorted.
     * @param {string} recipientUserId - The UUID of the recipient account.
     * @param {{limit?: number, offset?: number, isRead?: boolean, sortBy?: 'createdAt', order?: 'asc' | 'desc'}} [options={}] - Pagination, filtering, and sorting options.
     * @returns {Promise<Notification[]>} An array of Notification instances.
     */
    async getByRecipient(recipientUserId, options = {}) {
        // Destructure options with default values
        const {limit = 25, offset = 0, isRead, sortBy = 'createdAt', order = 'desc'} = options;
        // Validate sort field and order
        const validSortBy = ['createdAt'].includes(sortBy) ? sortBy : 'createdAt'; // Only createdAt makes sense here
        const validOrder = ['asc', 'desc'].includes(order) ? order : 'desc';

        try {
            // Start building the query
            const query = postgres('Notification')
                .where({recipientUserId})

            // Apply isRead filter if provided
            if (isRead !== undefined) {
                query.andWhere({isRead});
            }

            // Apply sorting, pagination
            query.orderBy(validSortBy, validOrder)
                .limit(limit)
                .offset(offset);

            // Execute the query
            const notificationRows = await query;

            // Convert each row to a Notification model instance
            return notificationRows.map(Notification.fromDbRow);
        } catch (error) {
            // Log errors encountered while finding notifications
            console.error(`Error finding notifications by recipient (${recipientUserId}):`, error);
            // Re-throw the error
            throw error;
        }
    }

    /**
     * Counts notifications for a specific recipient, optionally filtered by read status.
     * @param {string} recipientUserId - The ID of the recipient user.
     * @param {Object} [filters] - Optional filters for counting.
     * @param {boolean} [filters.isRead] - Filter by read status.
     * @returns {Promise<number>} The count of notifications matching the criteria.
     */
    async countByRecipient(recipientUserId, filters = {}) { // <-- Updated
        const {isRead} = filters;
        try {
            const query = postgres('Notification').where({recipientUserId}); // <-- Updated

            if (isRead !== undefined) {
                query.andWhere({isRead});
            }
            const result = await query.count({count: '*'}).first();
            return parseInt(result?.count, 10) || 0;
        } catch (error) {
            console.error(`Error counting notifications for recipient (${recipientUserId}):`, error);
            throw error;
        }
    }


    /**
     * Marks multiple notifications as read for a specific recipient.
     * @param {string} recipientAccountId - The UUID of the recipient account.
     * @param {string[]} notificationIds - An array of notification IDs to mark as read.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of notifications updated.
     */
    async markAsRead(recipientAccountId, notificationIds, trx = null) {
        if (!notificationIds || notificationIds.length === 0) {
            return 0; // Nothing to update
        }
        const queryBuilder = trx ?? postgres;
        try {
            return await queryBuilder('Notification')
                .where({recipientAccountId})
                .whereIn('notificationId', notificationIds)
                .andWhere({isRead: false}) // Only update if currently unread
                .update({isRead: true});
        } catch (error) {
            console.error(`Error marking notifications as read for recipient (${recipientAccountId}):`, error);
            throw error;
        }
    }

    /**
     * Marks ALL unread notifications as read for a specific recipient.
     * @param {string} recipientAccountId - The UUID of the recipient account.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of notifications updated.
     */
    async markAllAsRead(recipientAccountId, trx = null) {
        const queryBuilder = trx ?? postgres;
        try {
            return await queryBuilder('Notification')
                .where({recipientAccountId, isRead: false})
                .update({isRead: true});
        } catch (error) {
            console.error(`Error marking all notifications as read for recipient (${recipientAccountId}):`, error);
            throw error;
        }
    }
}

// Export a singleton instance of the DAO
export default new NotificationDAO();
