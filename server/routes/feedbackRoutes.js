import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getMyFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  respondToFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Guest routes
router.post('/', authorizeRoles('guest'), createFeedback);
router.get('/my-feedback', authorizeRoles('guest'), getMyFeedback);

// Admin/Manager routes
router.get('/', authorizeRoles('admin', 'manager', 'receptionist'), getAllFeedback);
router.get('/:id', authorizeRoles('admin', 'manager', 'receptionist'), getFeedbackById);
router.patch('/:id/status', authorizeRoles('admin', 'manager'), updateFeedbackStatus);
router.post('/:id/response', authorizeRoles('admin', 'manager'), respondToFeedback);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteFeedback);

export default router;
