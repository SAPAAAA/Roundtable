import express from 'express';
import SubtableController from "#controllers/subtable.controller.js";

const router = express.Router();
router.get('/:subtableName', SubtableController.getSubtableDetails);
export default router;