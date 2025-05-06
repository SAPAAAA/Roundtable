// backend/daos/profile.dao.js
import {postgresInstance} from '#db/postgres.js';
import Profile from '#models/profile.model.js';

class ProfileDAO {
    constructor() {
        this.tableName = 'Profile';
    }

    async getById(profileId, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const profileRow = await queryBuilder(this.tableName).where({profileId}).first();
            return profileRow ? Profile.fromDbRow(profileRow) : null;
        } catch (error) {
            console.error(`[ProfileDAO] Error fetching profile by ID ${profileId}:`, error);
            throw error;
        }
    }

    async create(profile, trx = null) {
        const queryBuilder = trx || postgresInstance;
        const {profileId, ...insertData} = profile;
        try {
            const insertedRows = await queryBuilder(this.tableName).insert(insertData).returning('*');
            if (!insertedRows || insertedRows.length === 0) {
                throw new Error('Profile creation in DAO failed: No data returned.');
            }
            return Profile.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('[ProfileDAO] Error creating profile:', error);
            throw error;
        }
    }

    async update(profileId, updateData, trx = null) {
        const queryBuilder = trx || postgresInstance;
        try {
            const {...allowedUpdates} = updateData; // Filter as needed
            if (Object.keys(allowedUpdates).length === 0) {
                return 0;
            }

            return await queryBuilder(this.tableName)
                .where({profileId})
                .update(allowedUpdates);
        } catch (error) {
            console.error(`[ProfileDAO] Error updating profile ${profileId}:`, error);
            throw error;
        }
    }
}

export default new ProfileDAO();