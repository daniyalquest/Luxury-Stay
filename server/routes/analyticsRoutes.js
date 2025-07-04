import express from 'express';
import {
  getDashboardStats,
  getOccupancyReport,
  getRevenueReport,
  getGuestReport,
  getGuestAnalytics,
  getFeedbackAnalytics,
  getOperationalReport
} from '../controllers/analyticsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// All analytics routes are restricted to admin and manager roles
router.get('/dashboard-stats', authorizeRoles('admin', 'manager'), getDashboardStats);
router.get('/occupancy-report', authorizeRoles('admin', 'manager'), getOccupancyReport);
router.get('/revenue-report', authorizeRoles('admin', 'manager'), getRevenueReport);
router.get('/guest-report', authorizeRoles('admin', 'manager'), getGuestReport);
router.get('/guest-analytics', authorizeRoles('admin', 'manager'), getGuestAnalytics);
router.get('/feedback-analytics', authorizeRoles('admin', 'manager'), getFeedbackAnalytics);
router.get('/operational-report', authorizeRoles('admin', 'manager'), getOperationalReport);

export default router;
