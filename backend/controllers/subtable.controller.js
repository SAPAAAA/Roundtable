import HTTP_STATUS from '#constants/httpStatus.js';
import subtableService from '#services/subtable.service.js';
//import {Subtable} from "#models/subtable.model.js";
class SubtableController {
    constructor(subtableService) {
        this.subtableService = subtableService;
        this.getSubtableDetails = this.getSubtableDetails.bind(this);
        
    }
    getSubtableDetails = async (req, res, next) => {
        try{
            console.log("kien")
            const {subtableName} = req.params;
            //const userId = req.session.userId;
            console.log("subtableName",subtableName)
            //console.log("userId",userId)

            const viewData = await this.subtableService.getSubtableDetails(subtableName);
            console.log("viewData",viewData)
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: viewData // Send the data returned by the service
            })
        }catch (error) {
            console.error(`[SubtableController.getSubtableDetails] Error fetching details for subtableId ${req.params?.subtableId}:`, error.message);
            next(error);
        }

    }
    // createSubtable = async (req, res) => {
        
    //     try {
    //         const { data } = req.body;
    //         const subtable = new Subtable(data);
    //         const userId = req.session.userId;

    //         // console.log("Subtable Data:", req.body);
    //         // console.log("Table ID:", tableId);
    //         // console.log("User ID:", userId);

    //         const newSubtable = await this.subtableService.createSubtable(subtable, userId);
    //         if (!newSubtable) {
    //             return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Failed to create subtable' });
    //         }
    //         res.status(HTTP_STATUS.CREATED).json({
    //             message: 'Subtable created successfully',
    //             data: {
    //                 subtable: { ...newSubtable },
    //             },
    //             success: true,
    //         });
    //     } catch (error) {
    //         res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create subtable' });
    //         console.error("Error creating subtable:", error);
    //     }
    // }
    // updateSubtable = async (req, res) => {
            
    //         try {
    //             const { subtableName } = req.params;
    //             const { updateData } = req.body;
    //             const updatedSubtable = await this.subtableService.updateSubtable(subtableName, updateData);
    //             if (!updatedSubtable) {
    //                 return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Failed to update subtable' });
    //             }
    //             res.status(HTTP_STATUS.OK).json({
    //                 message: 'Subtable updated successfully',
    //                 data: {
    //                     subtable: { ...updatedSubtable },
    //                 },
    //                 success: true,
    //             });
    //         } catch (error) {
    //             res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update subtable' });
    //             console.error("Error updating subtable:", error);
    //         }
    // }
    // deleteSubtable = async (req, res) => {
            
    //         try {
    //             const { subtableName } = req.params;
    
    //             const deletedSubtable = await this.subtableService.deleteSubtable(subtableName);
    //             if (!deletedSubtable) {
    //                 return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Failed to delete subtable' });
    //             }
    //             res.status(HTTP_STATUS.OK).json({
    //                 message: 'Subtable deleted successfully',
    //                 data: {
    //                     subtable: { ...deletedSubtable },
    //                 },
    //                 success: true,
    //             });
    //         } catch (error) {
    //             res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete subtable' });
    //             console.error("Error deleting subtable:", error);
    //         }
    // }

    
}
export default new SubtableController(subtableService);