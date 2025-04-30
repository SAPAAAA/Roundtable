import express from 'express';
import {isAuthenticated} from "#middlewares/auth.mdw.js";
import subtableController from "#controllers/subtable.controller.js";
const router = express.Router();
router.get('/:subtableName', subtableController.getSubtableDetails);
// router.post('/createSubtable', isAuthenticated, subtableController.createSubtable);
// router.put('/:subtableName', isAuthenticated, subtableController.updateSubtable);
// router.delete('/:subtableName', isAuthenticated, subtableController.deleteSubtable);
export default router;