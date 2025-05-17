import express from 'express';
import AuthController from '#controllers/auth.controller.js';
import {isNotAuthenticated} from "#middlewares/auth.mdw.js";
import {availableFilters, availableStorages, handleFieldsUpload} from "#middlewares/multer.mdw.js";

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/login', isNotAuthenticated, AuthController.login);
router.get('/session', AuthController.checkSession);
router.post('/logout', AuthController.logout);
router.put('/profile',
    handleFieldsUpload([
            {name: 'avatarFile', maxCount: 1, maxIndividualSize: 5 * 1024 * 1024},
            {name: 'bannerFile', maxCount: 1, maxIndividualSize: 5 * 1024 * 1024}
        ],
        {
            limits: {fileSize: 5 * 1024 * 1024},
            fileFilter: availableFilters.imagesOnly,
            storage: availableStorages.memory
        }
    ),
    AuthController.updateProfile);

export default router;