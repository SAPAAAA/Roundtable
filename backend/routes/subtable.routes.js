import express from 'express';
import SubtableController from "#controllers/subtable.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/', isAuthenticated, SubtableController.createSubtable);
router.get('/search', SubtableController.searchSubtables);
router.get('/subscribed', isAuthenticated, SubtableController.getSubscribedSubtables);
router.get('/:subtableName', SubtableController.getSubtableDetails);
router.get('/:subtableName/posts', SubtableController.getSubtablePosts);

export default router;