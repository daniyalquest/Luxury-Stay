import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  broadcastNotification
} from '../controllers/notificationController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager'), createNotification);
router.post('/broadcast', authorizeRoles('admin', 'manager'), broadcastNotification);
router.get('/', getUserNotifications);
router.get('/stats', getNotificationStats);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
