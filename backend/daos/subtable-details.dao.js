// backend/daos/subtable-details.dao.js
import {postgresInstance} from '#configs/postgres.config.js';
import SubtableDetails from '#models/subtable-details.model.js';

class SubtableDetailsDAO {
    constructor() {
        this.viewName = 'SubtableDetails'; // Using the view name
    }

    /**
     * Finds subtable details by its unique ID (UUID).
     * @param {string} subtableId - The UUID of the subtable.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<SubtableDetails | null>} The SubtableDetails instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getById(subtableId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            // Ensure the column name matches the view definition
            const row = await queryBuilder(this.viewName).where({subtableId: subtableId}).first();
            return SubtableDetails.fromDbRow(row);
        } catch (error) {
            console.error(`[SubtableDetailsDAO] Error finding subtable details by ID (${subtableId}):`, error);
            throw error;
        }
    }

    /**
     * Finds subtable details by its unique name.
     * @param {string} name - The name of the subtable.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<SubtableDetails | null>} The SubtableDetails instance or null if not found.
     * @throws {Error} For database errors.
     */
    async getByName(name, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const row = await queryBuilder(this.viewName).where({name: name}).first();
            return SubtableDetails.fromDbRow(row);
        } catch (error) {
            console.error(`[SubtableDetailsDAO] Error finding subtable details by name (${name}):`, error);
            throw error;
        }
    }

    /**
     * Retrieves a list of all subtable details, with pagination and sorting.
     * @param {object} [options={}] - Options for pagination, filtering, and sorting.
     * @param {number} [options.limit=25] - Max items per page.
     * @param {number} [options.offset=0] - Items to skip.
     * @param {'subtableCreatedAt' | 'memberCount' | 'name'} [options.sortBy='subtableCreatedAt'] - Field to sort by (must exist in the view).
     * @param {'asc'|'desc'} [options.order='desc'] - Sort order.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<SubtableDetails[]>} An array of SubtableDetails instances.
     * @throws {Error} For database errors.
     */
    async getAll(options = {}, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {
            limit = 25,
            offset = 0,
            sortBy = 'subtableCreatedAt', // Default sort by creation date of the subtable
            order = 'desc'
        } = options;

        // Validate sortBy field to prevent SQL injection and ensure it's a valid column in the view
        const validSortFields = ['subtableId', 'name', 'subtableCreatedAt', 'memberCount', 'creatorUsername', 'creatorDisplayName'];
        const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'subtableCreatedAt';
        const safeOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

        try {
            const rows = await queryBuilder(this.viewName)
                .orderBy(safeSortBy, safeOrder)
                .limit(limit)
                .offset(offset);
            return rows.map(SubtableDetails.fromDbRow);
        } catch (error) {
            console.error('[SubtableDetailsDAO] Error retrieving all subtable details:', error);
            throw error;
        }
    }

    /**
     * Searches for subtables by name or description using LIKE '%searchTerm%'.
     * Queries the "SubtableDetails" view. For more performant full-text search,
     * consider querying the base "Subtable" table with appropriate GIN/GIST indexes if available.
     * @param {string} searchTerm - The term to search for.
     * @param {object} [options={}] - Options for pagination and sorting.
     * @param {number} [options.limit=10] - Max items per page.
     * @param {number} [options.offset=0] - Items to skip.
     * @param {'name' | 'memberCount' | 'subtableCreatedAt'} [options.sortBy='name'] - Field to sort results by.
     * @param {'asc'|'desc'} [options.order='asc'] - Sort order.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<SubtableDetails[]>} An array of matching SubtableDetails instances.
     * @throws {Error} For database errors.
     */
    async searchByNameOrDescription(searchTerm, options = {}, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {
            limit = 10,
            offset = 0,
            sortBy = 'name', // Default sort for search results
            order = 'asc'
        } = options;

        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return [];
        }

        const validSortFields = ['name', 'memberCount', 'subtableCreatedAt'];
        const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
        const safeOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'asc';

        try {
            const rows = await queryBuilder(this.viewName)
                .where(function () {
                    this.where('name', 'ILIKE', `%${searchTerm}%`) // Case-insensitive LIKE
                        .orWhere('description', 'ILIKE', `%${searchTerm}%`);
                })
                .orderBy(safeSortBy, safeOrder)
                .limit(limit)
                .offset(offset);
            return rows.map(SubtableDetails.fromDbRow);
        } catch (error) {
            console.error(`[SubtableDetailsDAO] Error searching subtable details by term (${searchTerm}):`, error);
            throw error;
        }
    }

    /**
     * Counts the total number of subtables available in the view.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional transaction object.
     * @returns {Promise<number>} The total count of subtables.
     * @throws {Error} For database errors.
     */
    async countAll(trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const result = await queryBuilder(this.viewName).count({count: '*'}).first();
            return parseInt(result?.count, 10) || 0;
        } catch (error) {
            console.error('[SubtableDetailsDAO] Error counting all subtable details:', error);
            throw error;
        }
    }
}

export default new SubtableDetailsDAO();