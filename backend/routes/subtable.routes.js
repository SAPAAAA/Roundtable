import express from 'express';
import {availableFilters, availableStorages, handleFieldsUpload} from "#middlewares/multer.mdw.js";
import SubtableController from "#controllers/subtable.controller.js";
import {isAuthenticated} from "#middlewares/auth.mdw.js";

const router = express.Router();

router.post('/',
    handleFieldsUpload([
            {name: 'iconFile', maxCount: 1, maxIndividualSize: 5 * 1024 * 1024},
            {name: 'bannerFile', maxCount: 1, maxIndividualSize: 5 * 1024 * 1024}
        ],
        {
            limits: {fileSize: 5 * 1024 * 1024},
            fileFilter: availableFilters.imagesOnly,
            storage: availableStorages.memory
        }
    ),
    isAuthenticated,
    SubtableController.createSubtable);
router.get('/search', SubtableController.searchSubtables);
router.get('/subscribed', isAuthenticated, SubtableController.getSubscribedSubtables);
router.get('/:subtableName', SubtableController.getSubtableDetailsByName);
router.get('/:subtableName/posts', SubtableController.getSubtablePosts);

export default router;