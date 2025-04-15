import db from '#utils/db.js';
import RegisteredUser from '#models/registeredUser.model.js';

class RegisteredUserDAO {
    async create(registeredUser, trx) {
        const queryBuilder = trx ? trx : db;

        const {userId, ...insertData} = registeredUser;
        try {
            // Pass the cleaned 'insertData' to Knex insert
            const insertedRows = await queryBuilder('RegisteredUser').insert(insertData).returning('*');

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('RegisteredUser creation failed or did not return expected data.', insertedRows);
                throw new Error('Database error during RegisteredUser creation: No data returned.');
            }
            // Use the first element (which includes the DB-generated userId and defaults)
            return RegisteredUser.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating registered user:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async getById(registeredUserId) {
        try {
            const registeredUserRow = await db('RegisteredUser').where({registeredUserId}).first();
            if (!registeredUserRow) {
                return null;
            }
            return RegisteredUser.fromDbRow(registeredUserRow);
        } catch (error) {
            console.error('Error fetching registered user:', error);
            throw error;
        }
    }
}

export default new RegisteredUserDAO();