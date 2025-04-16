import postgres from "#db/postgres.js";
import Principal from "#models/principal.model.js";

class PrincipalDAO {
    async create(principal, trx) {
        const queryBuilder = trx ? trx : postgres;

        const {principalId, ...insertData} = principal;
        try {
            // Pass the cleaned 'insertData' to Knex insert
            const insertedRows = await queryBuilder("Principal").insert(insertData).returning("*");

            // Check if we got an array and it's not empty
            if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
                console.error(
                    "Principal creation failed or did not return expected data.",
                    insertedRows
                );
                throw new Error(
                    "Database error during Principal creation: No data returned."
                );
            }
            // Use the first element (which includes the DB-generated principalId)
            return Principal.fromDbRow(insertedRows[0]);
        } catch (error) {
            console.error("Error creating principal:", error);
            // Re-throw the original error
            throw error;
        }
    }

    async getById(principalId) {
        try {
            // .first() returns the object directly or undefined
            const principalRow = await postgres("Principal").where({principalId}).first();
            // Check if a principal was actually found
            if (!principalRow) {
                return null; // Return null if not found
            }
            // Only call fromDbRow if we found a principal
            return Principal.fromDbRow(principalRow);
        } catch (error) {
            console.error("Error fetching principal:", error);
            // Re-throw the original error
            throw error;
        }
    }

    async delete(principalId, trx) {
        const queryBuilder = trx ? trx : postgres;
        try {
            // .del() returns the number of affected rows
            const affectedRows = await queryBuilder("Principal").where({principalId}).del();
            // Return true if 1 or more rows were deleted, false otherwise
            return affectedRows > 0;
        } catch (error) {
            console.error("Error deleting principal:", error);
            // Re-throw the original error
            throw error;
        }
    }
}

export default new PrincipalDAO();