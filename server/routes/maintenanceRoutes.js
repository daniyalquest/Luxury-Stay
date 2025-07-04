import express from 'express';
import {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceStats
} from '../controllers/maintenanceController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager', 'receptionist', 'housekeeping', 'guest'), createMaintenanceRequest);
router.get('/', authorizeRoles('admin', 'manager', 'receptionist', 'housekeeping'), getAllMaintenanceRequests);
router.get('/stats', authorizeRoles('admin', 'manager'), getMaintenanceStats);
router.get('/:id', authorizeRoles('admin', 'manager', 'receptionist', 'housekeeping'), getMaintenanceById);
router.put('/:id', authorizeRoles('admin', 'manager', 'housekeeping'), updateMaintenanceRequest);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteMaintenanceRequest);

export default router;
