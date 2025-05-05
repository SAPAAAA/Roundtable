import express from 'express';
import SubtableController from "#controllers/subtable.controller.js";

const router = express.Router();

router.get('/subscribed', SubtableController.getSubscribedSubtables);
router.get('/:subtableName', SubtableController.getSubtableDetails);
router.get('/:subtableName/posts', SubtableController.getSubtablePosts);

export default router;