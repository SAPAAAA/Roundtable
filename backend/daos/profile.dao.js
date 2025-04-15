import db from '#utils/db.js';
import Profile from '#models/profile.model.js';

class ProfileDAO {
    async create(profile, trx) {
        const queryBuilder = trx ? trx : db;

        const {profileId, ...insertData} = profile;
        try {
            // Pass the cleaned 'insertData' to Knex insert
            const insertedRows = await queryBuilder('Profile').insert(insertData).returning('*');

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Profile creation failed or did not return expected data.', insertedRows);
                throw new Error('Database error during profile creation: No data returned.');
            }
            // Use the first element (which includes the DB-generated profileId)
            return Profile.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating profile:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async getById(profileId) {
        try {
            // .first() returns the object directly or undefined
            const profileRow = await db('Profile').where({profileId}).first();
            // Check if a profile was actually found
            if (!profileRow) {
                return null; // Return null if not found
            }
            // Only call fromDbRow if we found a profile
            return Profile.fromDbRow(profileRow);
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async delete(profileId, trx) {
        const queryBuilder = trx ? trx : db;
        try {
            // .del() returns the number of affected rows
            const affectedRows = await queryBuilder('Profile').where({profileId}).del();
            // Return true if 1 or more rows were deleted, false otherwise
            return affectedRows > 0;
        } catch (error) {
            console.error('Error deleting profile:', error);
            // Re-throw the original error
            throw error;
        }
    }
}

export default new ProfileDAO();