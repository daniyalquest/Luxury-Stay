import express from 'express';
import {
  createHousekeepingTask,
  getAllHousekeepingTasks,
  getHousekeepingById,
  updateHousekeepingTask,
  markTaskCompleted,
  getHousekeepingSchedule,
  getHousekeepingStats
} from '../controllers/housekeepingController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager', 'housekeeping'), createHousekeepingTask);
router.get('/', authorizeRoles('admin', 'manager', 'housekeeping'), getAllHousekeepingTasks);
router.get('/schedule', authorizeRoles('admin', 'manager', 'housekeeping'), getHousekeepingSchedule);
router.get('/stats', authorizeRoles('admin', 'manager'), getHousekeepingStats);
router.get('/:id', authorizeRoles('admin', 'manager', 'housekeeping'), getHousekeepingById);
router.put('/:id', authorizeRoles('admin', 'manager', 'housekeeping'), updateHousekeepingTask);
router.patch('/:id/complete', authorizeRoles('housekeeping'), markTaskCompleted);

export default router;
