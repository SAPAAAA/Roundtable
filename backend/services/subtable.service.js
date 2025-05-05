import UserPostDetailsDAO from '#daos/user-post-details.dao.js';
import SubtableDAO from '#daos/subtable.dao.js';

class SubtableService {
    async getSubtableDetails(subtableName) {
        console.log("service"+ subtableName)
        //console.log(`Fetching subtable details for subtableName: ${subtableName}`);

        // Fetch subtable details from the DAO
        //const subtableDetails = await UserPostDetailsDAO.getSubtableDetails(subtableName);
        const subtableDetails = await SubtableDAO.getByName(subtableName);
        const subtableRelatedPosts = await UserPostDetailsDAO.getBySubtableId(subtableDetails.subtableId);
        // console.log("subtableDetails + ", subtableDetails)

        // --- Success Response ---
        return {
            success: true,
            data: subtableRelatedPosts
        };
    }
    async createSubtable(subtable,userId) {
        //console.log(`Creating subtable for tableId: ${tableId}, userId: ${userId}, name: ${name}`);

        // Create subtable using the DAO
        const newSubtable = await SubtableDAO.create(subtable, userId);

        // --- Success Response ---
        return {
            success: true,
            data: newSubtable
        };
    }
    async updateSubtable(subtableName, updateData) {
        //console.log(`Updating subtable for subtableId: ${subtableId}, userId: ${userId}, name: ${name}`);

        // Update subtable using the DAO
        const updatedSubtable = await SubtableDAO.update(subtableName, updateData);

        // --- Success Response ---
        return {
            success: true,
            data: updatedSubtable
        };
    }
    async deleteSubtable(subtableName) { 
        //console.log(`Deleting subtable for subtableId: ${subtableId}, userId: ${userId}`);

        // Delete subtable using the DAO
        const deletedSubtable = await SubtableDAO.delete(subtableName);

        // --- Success Response ---
        return {
            success: true,
            data: deletedSubtable
        };
    }
    async getSubtables() {
        //console.log(`Fetching subtables for subtableName: ${subtableName}`);

        // Fetch subtables using the DAO
        const subtables = await SubtableDAO.getSubtables();

        // --- Success Response ---
        return {
            success: true,
            data: subtables
        };
    }

}
export default new SubtableService();