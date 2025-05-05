import express from 'express';
import SubtableController from "#controllers/subtable.controller.js";

const router = express.Router();
router.get('/:subtableName', SubtableController.getSubtableDetails);
router.get('/:subtableName/submit', SubtableController.getSubtables);

export default router;