// backend/daos/media.dao.js
import {postgresInstance} from '#configs/postgres.config.js';
import Media, {MediaTypeEnum} from '#models/media.model.js';

class MediaDAO {
    constructor() {
        this.tableName = 'Media';
    }

    /**
     * Finds a media item by its unique ID (UUID).
     * @param {string} mediaId - The UUID of the media.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<Media | null>} The Media instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getById(mediaId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const mediaRow = await queryBuilder(this.tableName).where({mediaId}).first();
            return Media.fromDbRow(mediaRow);
        } catch (error) {
            console.error(`[MediaDAO] Error finding media by ID (${mediaId}):`, error);
            throw error;
        }
    }

    /**
     * Creates a new media record in the database.
     * @param {Omit<Media, 'mediaId' | 'createdAt'>} mediaData - The Media data to create.
     * `mediaId` and `createdAt` are ignored/handled by DB.
     * `uploaderUserId`, `url`, and `mediaType` are essential.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Media>} The newly created Media instance with DB-generated values.
     * @throws {Error} For database errors (e.g., constraint violations, missing required fields).
     */
    async create(mediaData, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {mediaId, createdAt, ...insertData} = mediaData;

        if (!insertData.url || !insertData.mediaType) {
            throw new Error('[MediaDAO] Missing required fields for creation: url and mediaType.');
        }
        if (!Object.values(MediaTypeEnum).includes(insertData.mediaType)) {
            throw new Error(`[MediaDAO] Invalid mediaType: ${insertData.mediaType}.`);
        }

        try {
            const insertedRows = await queryBuilder(this.tableName).insert(insertData).returning('*');
            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('[MediaDAO] Media creation failed: No data returned from insert operation.');
            }
            return Media.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[MediaDAO] Error creating media:', error);
            if (error.code === '23505' && error.constraint === 'Media_url_key') { // Check your exact constraint name
                throw new Error(`[MediaDAO] Media with URL '${insertData.url}' already exists.`);
            }
            if (error.code === '23503') { // Foreign key violation
                if (error.constraint === 'media_uploaderuserid_fkey') { // Check your exact constraint name
                    throw new Error(`[MediaDAO] Uploader user with ID '${insertData.uploaderUserId}' does not exist.`);
                }
            }
            throw error;
        }
    }

    /**
     * Updates an existing media record.
     * Note: The "Media" table has limited fields suitable for updates.
     * `url` is unique and `mediaType`, `fileSize` are generally immutable.
     * This method primarily demonstrates structure; real-world use cases for updating media metadata might be limited with the current schema.
     * @param {string} mediaId - The ID of the media to update.
     * @param {Partial<Pick<Media, 'uploaderUserId' | 'url' | 'mimeType'>>} updatedMedia - An object containing fields to update.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Media | null>} The updated Media instance, or null if not found or no rows updated.
     * @throws {Error} For database errors.
     */
    async update(updatedMedia, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const allowedUpdates = {};

        if (!updatedMedia.mediaId) {
            throw new BadRequestError('Media ID is required for update.');
        }

        if (updatedMedia.uploaderUserId !== undefined) {
            allowedUpdates.uploaderUserId = updatedMedia.uploaderUserId;
        }
        if (updatedMedia.url !== undefined) {
            allowedUpdates.url = updatedMedia.url;
        }
        if (updatedMedia.mimeType !== undefined) {
            allowedUpdates.mimeType = updatedMedia.mimeType;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            throw new BadRequestError('No valid fields provided for update.');
        }

        try {
            const updatedRows = await queryBuilder(this.tableName)
                .where({mediaId: updatedMedia.mediaId})
                .update(allowedUpdates)
                .returning('*');

            if (!updatedRows || updatedRows.length === 0) {
                return null; // Not found or data was already in the target state
            }
            return Media.fromDbRow(updatedRows[0]);
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'Media_url_key') {
                throw new Error(`[MediaDAO] Update failed: Media with URL '${updatedMedia.url}' already exists.`);
            }
            if (error.code === '23503' && error.constraint === 'media_uploaderuserid_fkey') {
                throw new Error(`[MediaDAO] Update failed: Uploader user with ID '${updatedMedia.uploaderUserId}' does not exist.`);
            }
            throw error;
        }
    }

    /**
     * Deletes a media item by its ID.
     * @param {string} mediaId - The UUID of the media to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<boolean>} True if deletion was successful (1 row affected), false otherwise.
     * @throws {Error} For database errors.
     */
    async delete(mediaId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const deletedRowsCount = await queryBuilder(this.tableName).where({mediaId}).del();
            return deletedRowsCount > 0;
        } catch (error) {
            console.error(`[MediaDAO] Error deleting media by ID (${mediaId}):`, error);
            // Foreign key constraints might prevent deletion if this mediaId is referenced elsewhere
            // and ON DELETE SET NULL/CASCADE is not appropriately set on those referencing tables.
            // The current schema uses ON DELETE SET NULL for Profile.avatar/banner and Subtable.icon/banner.
            throw error;
        }
    }

    /**
     * Finds media items uploaded by a specific user, optionally paginated and sorted.
     * @param {string} uploaderUserId - The UUID of the uploader.
     * @param {object} [options={}] - Options for pagination and sorting.
     * @param {number} [options.limit=25] - Max media items per page.
     * @param {number} [options.offset=0] - Media items to skip.
     * @param {'createdAt' | 'fileSize' | 'mediaType'} [options.sortBy='createdAt'] - Field to sort by.
     * @param {'asc'|'desc'} [options.order='desc'] - Sort order.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<Media[]>} An array of Media instances.
     * @throws {Error} For database errors.
     */
    async getByUploader(uploaderUserId, options = {}, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {limit = 25, offset = 0, sortBy = 'createdAt', order = 'desc'} = options;

        const validSortFields = ['createdAt', 'fileSize', 'mediaType']; // Add other valid sortable columns from Media table
        const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            const query = queryBuilder(this.tableName).where({uploaderUserId});
            query.orderBy(validSortBy, validOrder).limit(limit).offset(offset);

            const mediaRows = await query;
            return mediaRows.map(Media.fromDbRow);
        } catch (error) {
            console.error(`[MediaDAO] Error finding media by uploader (${uploaderUserId}):`, error);
            throw error;
        }
    }

    /**
     * Counts media items for a specific uploader.
     * @param {string} uploaderUserId - The ID of the uploader user.
     * @param {object} [filters={}] - Optional filters (e.g., by mediaType).
     * @param {MediaTypeEnum} [filters.mediaType] - Filter by media type.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<number>} The count of media items matching the criteria.
     * @throws {Error} For database errors.
     */
    async countByUploader(uploaderUserId, filters = {}, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {mediaType} = filters;
        try {
            const query = queryBuilder(this.tableName).where({uploaderUserId});

            if (mediaType && Object.values(MediaTypeEnum).includes(mediaType)) {
                query.andWhere({mediaType});
            }

            const result = await query.count({count: '*'}).first();
            return parseInt(result?.count, 10) || 0;
        } catch (error) {
            console.error(`[MediaDAO] Error counting media for uploader (${uploaderUserId}):`, error);
            throw error;
        }
    }

    /**
     * Finds a media item by its URL.
     * Since URL is unique, this should return at most one item.
     * @param {string} url - The URL of the media.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<Media | null>} The Media instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getByUrl(url, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const mediaRow = await queryBuilder(this.tableName).where({url}).first();
            return Media.fromDbRow(mediaRow);
        } catch (error) {
            console.error(`[MediaDAO] Error finding media by URL (${url}):`, error);
            throw error;
        }
    }
}

export default new MediaDAO();