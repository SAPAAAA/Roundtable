import HTTP_STATUS from '#constants/httpStatus.js';
import userPostDetailsDao from '#daos/userPostDetails.dao.js';
import subtableDAO from '#daos/subtable.dao.js';
class SubtableService {
    async getSubtableDetails(subtableName) {
        console.log("service"+ subtableName)
        //console.log(`Fetching subtable details for subtableName: ${subtableName}`);

        // Fetch subtable details from the DAO
        const subtableDetails = await userPostDetailsDao.getSubtableDetails(subtableName);
        // console.log("subtableDetails + ", subtableDetails)

        // --- Success Response ---
        return {
            success: true,
            data: subtableDetails
        };
    }
    async createSubtable(subtable,userId) {
        //console.log(`Creating subtable for tableId: ${tableId}, userId: ${userId}, name: ${name}`);

        // Create subtable using the DAO
        const newSubtable = await subtableDAO.create(subtable, userId);

        // --- Success Response ---
        return {
            success: true,
            data: newSubtable
        };
    }
    async updateSubtable(subtableName, updateData) {
        //console.log(`Updating subtable for subtableId: ${subtableId}, userId: ${userId}, name: ${name}`);

        // Update subtable using the DAO
        const updatedSubtable = await subtableDAO.update(subtableName, updateData);

        // --- Success Response ---
        return {
            success: true,
            data: updatedSubtable
        };
    }
    async deleteSubtable(subtableName) { 
        //console.log(`Deleting subtable for subtableId: ${subtableId}, userId: ${userId}`);

        // Delete subtable using the DAO
        const deletedSubtable = await subtableDAO.delete(subtableName);

        // --- Success Response ---
        return {
            success: true,
            data: deletedSubtable
        };
    }
}
export default new SubtableService();