// backend/routes/notification.routes.js (NEW FILE)

import express from 'express';
import notificationController from '#controllers/notification.controller.js';
import {isAuthenticated} from '#middlewares/auth.mdw.js';

const router = express.Router();

router.get('/', isAuthenticated, notificationController.getUserNotifications);
router.get('/count', isAuthenticated, notificationController.getUnreadNotificationCount);

export default router;