import {postgresInstance} from '#db/postgres.js';
import RegisteredUser from '#models/registered-user.model.js';

class RegisteredUserDAO {
    async create(registeredUser, trx) {
        const queryBuilder = trx || postgresInstance;

        const {userId, ...insertData} = registeredUser;
        try {
            // Pass the cleaned 'insertData' to Knex insert
            const insertedRows = await queryBuilder('RegisteredUser').insert(insertData).returning('*');

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('RegisteredUser creation failed or did not return expected data.', insertedRows);
                throw new Error('PostgresDB error during RegisteredUser creation: No data returned.');
            }
            // Use the first element (which includes the DB-generated userId and defaults)
            return RegisteredUser.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating registered user:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async getByPrincipalId(principalId) {
        try {
            const registeredUserRow = await postgresInstance('RegisteredUser').where({principalId}).first();
            if (!registeredUserRow) {
                return null;
            }
            return RegisteredUser.fromDbRow(registeredUserRow);
        } catch (error) {
            console.error('Error fetching registered user:', error);
            throw error;
        }
    }

    async getById(userId) {
        try {
            const registeredUserRow = await postgresInstance('RegisteredUser').where({userId}).first();
            if (!registeredUserRow) {
                return null;
            }
            return RegisteredUser.fromDbRow(registeredUserRow);
        } catch (error) {
            console.error('Error fetching registered user:', error);
            throw error;
        }
    }

    async delete(userId, trx) {
        const queryBuilder = trx || postgresInstance;
        try {
            const affectedRows = await queryBuilder('RegisteredUser').where({userId}).del();
            return affectedRows > 0;
        } catch (error) {
            console.error('Error deleting registered user:', error);
            throw error;
        }
    }

    async update(userId, updatedData, trx) {
        const queryBuilder = trx || postgresInstance;
        try {
            const affectedRows = await queryBuilder('RegisteredUser').where({userId}).update(updatedData);
            return affectedRows > 0;
        } catch (error) {
            console.error('Error updating registered user:', error);
            throw error;
        }
    }
}

export default new RegisteredUserDAO();