// daos/subtable.dao.js
import {postgresInstance} from '#db/postgres.js';
import Subtable from '#models/subtable.model.js';

class SubtableDAO {
    /**
     * Finds a subtable by its unique ID (UUID).
     * @param {string} subtableId - The UUID of the subtable.
     * @returns {Promise<Subtable | null>} The Subtable instance or null if not found.
     */
    async getById(subtableId) {
        try {
            const subtableRow = await postgresInstance('Subtable').where({subtableId}).first();
            return Subtable.fromDbRow(subtableRow); // Returns null if subtableRow is undefined
        } catch (error) {
            console.error(`Error finding subtable by ID (${subtableId}):`, error);
            throw error; // Re-throw for upstream handling
        }
    }

    /**
     * Finds a subtable by its unique name (case-sensitive based on DB collation).
     * @param {string} name - The name of the subtable.
     * @returns {Promise<Subtable | null>} The Subtable instance or null if not found.
     */
    async getByName(name) {
        try {
            const subtableRow = await postgresInstance('Subtable').where({name}).first();
            return Subtable.fromDbRow(subtableRow);
        } catch (error) {
            console.error(`Error finding subtable by name (${name}):`, error);
            throw error;
        }
    }

    /**
     * Creates a new subtable record in the database.
     * @param {Subtable} subtable - The Subtable instance to create (subtableId, createdAt, memberCount are ignored).
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Subtable>} The newly created Subtable instance with DB-generated values.
     */
    async create(subtable, trx = null) {
        const queryBuilder = trx ? trx : postgresInstance;
        // Exclude fields managed by the database automatically (like defaults or sequences)
        // name is required, description, creatorPrincipalId, iconUrl, bannerUrl are nullable
        const {subtableId, createdAt, memberCount, ...insertData} = subtable;

        try {
            const insertedRows = await queryBuilder('Subtable').insert(insertData).returning('*');

            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Subtable creation failed or did not return expected data.', insertedRows);
                throw new Error('PostgresDB error during subtable creation: No data returned.');
            }
            // Return the full subtable object including DB-generated fields
            return Subtable.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating subtable:', error);
            // Check for unique constraint violation (e.g., duplicate name)
            if (error.code === '23505') { // PostgreSQL unique violation code
                // You might want to wrap this in a custom error class
                const specificError = new Error(`Subtable name "${insertData.name}" is already taken.`);
                specificError.statusCode = 409; // Conflict
                throw specificError;
            }
            throw error; // Re-throw other errors
        }
    }

    /**
     * Updates an existing subtable.
     * @param {string} subtableId - The ID of the subtable to update.
     * @param {Partial<Subtable>} updateData - An object containing fields to update.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<Subtable | null>} The updated Subtable instance, or null if not found.
     */
    async update(subtableId, updateData, trx = null) {
        const queryBuilder = trx ? trx : postgresInstance;
        // Remove fields that shouldn't be directly updated this way
        const {
            subtableId: _,
            createdAt: __,
            creatorPrincipalId: ___,
            memberCount: ____,
            ...allowedUpdates
        } = updateData;

        if (Object.keys(allowedUpdates).length === 0) {
            console.warn(`Subtable update called for ID ${subtableId} with no valid fields to update.`);
            // Optionally fetch and return the current record or throw an error
            return this.getById(subtableId); // Return current state
        }

        try {
            const updatedRows = await queryBuilder('Subtable')
                .where({subtableId})
                .update(allowedUpdates)
                .returning('*');

            if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
                return null; // Indicate subtable not found
            }
            return Subtable.fromDbRow(updatedRows[0]);
        } catch (error) {
            console.error(`Error updating subtable (${subtableId}):`, error);
            // Check for unique constraint violation (e.g., trying to change name to an existing one)
            if (error.code === '23505') {
                const specificError = new Error(`Cannot update subtable: name "${allowedUpdates.name}" might already be taken.`);
                specificError.statusCode = 409; // Conflict
                throw specificError;
            }
            throw error;
        }
    }

    /**
     * Deletes a subtable by its ID. Use with caution!
     * Consider soft-delete mechanisms in a real application.
     * @param {string} subtableId - The ID of the subtable to delete.
     * @param {import('knex').Knex.Transaction | null} [trx=null] - Optional Knex transaction object.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     */
    async delete(subtableId, trx = null) {
        const queryBuilder = trx ? trx : postgresInstance;
        try {
            const deletedCount = await queryBuilder('Subtable')
                .where({subtableId})
                .del(); // .delete() is also an alias

            console.log(`Attempted deletion for subtableId ${subtableId}. Rows affected: ${deletedCount}`);
            return deletedCount;
        } catch (error) {
            console.error(`Error deleting subtable (${subtableId}):`, error);
            throw error;
        }
    }

    // Potential future methods: listAll, searchByName, etc.
}

export default new SubtableDAO();