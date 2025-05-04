// backend/routes/notification.routes.js (NEW FILE)

import express from 'express';
import NotificationController from '#controllers/notification.controller.js';
import {isAuthenticated} from '#middlewares/auth.mdw.js';

const router = express.Router();

router.get('/', isAuthenticated, NotificationController.getUserNotifications);
router.get('/count', isAuthenticated, NotificationController.getUnreadNotificationCount);
router.post('/:notificationId/read', isAuthenticated, NotificationController.markNotificationAsRead);

export default router;