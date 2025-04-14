import EmailVerificationCode from '#models/emailVerificationCode.model.js';

import db from '#utils/db.js';

class EmailVerificationCodeDAO {
    async create(emailVerificationCode, trx) {
        const queryBuilder = trx ? trx : db;
        const {verificationCodeId, ...insertData} = emailVerificationCode;
        try {
            // Pass the cleaned 'insertData' to Knex insert
            const insertedRows = await queryBuilder('EmailVerificationCode').insert(insertData).returning('*');

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('EmailVerificationCode creation failed or did not return expected data.', insertedRows);
                throw new Error('Database error during EmailVerificationCode creation: No data returned.');
            }
            // Use the first element (which includes the DB-generated emailVerificationCodeId)
            return EmailVerificationCode.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating email verification code:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async deleteByAccountId(accountId, trx) {
        const queryBuilder = trx ? trx : db;
        try {
            // .del() returns the number of affected rows
            const affectedRows = await queryBuilder('EmailVerificationCode').where({accountId}).del();
            // Return true if 1 or more rows were deleted, false otherwise
            return affectedRows > 0;
        } catch (error) {
            console.error('Error deleting email verification code:', error);
            // Re-throw the original error
            throw error;
        }
    }
}

export default new EmailVerificationCodeDAO();