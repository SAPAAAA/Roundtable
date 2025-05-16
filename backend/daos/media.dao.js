import {postgresInstance} from '#db/postgres.js';
import Media from '#models/media.model.js';
import {BadRequestError, InternalServerError} from '#errors/AppError.js';

class MediaDAO {
    constructor() {
        this.tableName = 'Media';
    }

    /**
     * Creates a new media record in the database.
     * @param {Media} media - The Media instance to create (mediaId and createdAt are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Media>} The newly created Media instance with DB-generated values.
     * @throws {BadRequestError} If required fields are missing.
     * @throws {InternalServerError} For database errors.
     */
    async create(media, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {mediaId, createdAt, ...insertData} = media;

        try {
            const insertedRows = await queryBuilder(this.tableName)
                .insert(insertData)
                .returning('*');

            if (!insertedRows || insertedRows.length === 0) {
                throw new InternalServerError('Media creation failed: No data returned.');
            }
            return Media.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[MediaDAO] Error creating media:', error);
            if (error.code === '23503') { // PostgreSQL foreign key violation
                throw new BadRequestError('Invalid uploaderUserId: User does not exist.');
            }
            throw new InternalServerError('Failed to create media record.');
        }
    }

    /**
     * Retrieves a media record by its ID.
     * @param {string} mediaId - The UUID of the media record.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Media | null>} The Media instance or null if not found.
     */
    async getById(mediaId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const mediaRow = await queryBuilder(this.tableName)
                .where({mediaId})
                .first();
            return mediaRow ? Media.fromDbRow(mediaRow) : null;
        } catch (error) {
            console.error(`[MediaDAO] Error fetching media by ID ${mediaId}:`, error);
            throw new InternalServerError('Failed to fetch media record.');
        }
    }

    /**
     * Deletes a media record by its ID.
     * @param {string} mediaId - The UUID of the media record to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<boolean>} True if the record was deleted, false if not found.
     */
    async deleteById(mediaId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const deletedCount = await queryBuilder(this.tableName)
                .where({mediaId})
                .delete();
            return deletedCount > 0;
        } catch (error) {
            console.error(`[MediaDAO] Error deleting media ${mediaId}:`, error);
            throw new InternalServerError('Failed to delete media record.');
        }
    }
}

export default new MediaDAO(); 