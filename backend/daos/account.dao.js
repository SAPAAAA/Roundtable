import {postgresInstance} from '#db/postgres.js';
import Account from '#models/account.model.js';

class AccountDAO {
    constructor() {
        this.tableName = 'Account';

        if (AccountDAO.instance) {
            return AccountDAO.instance;
        }
        AccountDAO.instance = this;
    }
    async getById(accountId) {
        try {
            // .first() returns the object directly or undefined
            const accountRow = await postgresInstance(this.tableName).where({accountId}).first();
            if (!accountRow) {
                // Explicitly return null or undefined when not found
                return null;
            }
            // Pass the found object (if it exists) to fromDbRow
            return Account.fromDbRow(accountRow);
        } catch (error) {
            console.error('Error finding account by ID:', error);
            // Re-throw the original error for better debugging upstream
            throw error;
            // Or wrap it: throw new Error(`PostgresDB error finding account by ID: ${error.message}`);
        }
    }

    async getByUsername(username) {
        try {
            // .first() returns the object directly or undefined
            const accountRow = await postgresInstance(this.tableName).where({username}).first();
            if (!accountRow) {
                return null;
            }
            return Account.fromDbRow(accountRow);
        } catch (error) {
            console.error('Error finding account by username:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async getByEmail(email) {
        try {
            // .first() returns the object directly or undefined
            const accountRow = await postgresInstance(this.tableName).where({email}).first();
            if (!accountRow) {
                return null;
            }
            return Account.fromDbRow(accountRow);
        } catch (error) {
            console.error('Error finding account by email:', error);
            // Re-throw the original error
            throw error;
        }
    }

    async create(account, trx) {
        const queryBuilder = trx ? trx : postgresInstance;

        const {accountId, created, updatedAt, ...insertData} = account;
        try {

            // Pass the cleaned 'insertData' object to Knex insert
            const insertedRows = await queryBuilder(this.tableName).insert(insertData).returning('*');

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error('Account creation failed or did not return expected data.', insertedRows);
                throw new Error('PostgresDB error during account creation: No data returned.');
            }
            // Use the first element of the array
            return Account.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error('Error creating account:', error);
            // Re-throw original error
            throw error;
        }
    }
}

export default new AccountDAO();