// backend/daos/registered-user.dao.js
import {postgresInstance} from '#db/postgres.js';
import RegisteredUser from '#models/registered-user.model.js';

class RegisteredUserDAO {
    constructor() {
        this.tableName = 'RegisteredUser';
    }

    async getById(userId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const userRow = await queryBuilder(this.tableName).where({userId}).first();
            return userRow ? RegisteredUser.fromDbRow(userRow) : null;
        } catch (error) {
            console.error(`[RegisteredUserDAO] Error fetching user by ID ${userId}:`, error);
            throw error;
        }
    }

    async getByPrincipalId(principalId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            // Ensure the column name here matches your database schema (e.g., principalId or principal_id)
            const userRow = await queryBuilder(this.tableName).where({principalId: principalId}).first();
            return userRow ? RegisteredUser.fromDbRow(userRow) : null;
        } catch (error) {
            console.error(`[RegisteredUserDAO] Error fetching user by Principal ID ${principalId}:`, error);
            throw error;
        }
    }

    async create(registeredUser, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {userId, ...insertData} = registeredUser;
        try {
            const insertedRows = await queryBuilder(this.tableName).insert(insertData).returning('*');
            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('RegisteredUser creation in DAO failed: No data returned.');
            }
            return RegisteredUser.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[RegisteredUserDAO] Error creating registered user:', error);
            throw error;
        }
    }

    async update(userId, updateData, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            // Ensure only allowed fields are updated, e.g., isVerified, status, karma, lastActive
            const {principalId, ...allowedUpdates} = updateData;

            if (Object.keys(allowedUpdates).length === 0) {
                return 0; // No fields to update
            }

            return await queryBuilder(this.tableName)
                .where({userId})
                .update(allowedUpdates); // Returns number of rows affected
        } catch (error) {
            console.error(`[RegisteredUserDAO] Error updating registered user ${userId}:`, error);
            throw error;
        }
    }
}

export default new RegisteredUserDAO();