// backend/routes/notification.routes.js (NEW FILE)

import express from 'express';
import notificationController from '#controllers/notification.controller.js';
import {isAuthenticated} from '#middlewares/auth.mdw.js';

const router = express.Router();

// GET /api/notifications - Fetch notifications for the logged-in user
router.get(
    '/',
    isAuthenticated, // Protect the route
    notificationController.getUserNotifications
);


export default router;