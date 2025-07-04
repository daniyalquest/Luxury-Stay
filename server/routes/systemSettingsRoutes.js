import express from 'express';
import {
  createSetting,
  getAllSettings,
  getSettingByKey,
  updateSetting,
  deleteSetting,
  getSettingsByCategory,
  bulkUpdateSettings
} from '../controllers/systemSettingsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin'), createSetting);
router.put('/bulk-update', authorizeRoles('admin'), bulkUpdateSettings);
router.get('/', authorizeRoles('admin', 'manager'), getAllSettings);
router.get('/category/:category', authorizeRoles('admin', 'manager'), getSettingsByCategory);
router.get('/:key', authorizeRoles('admin', 'manager'), getSettingByKey);
router.put('/:key', authorizeRoles('admin'), updateSetting);
router.delete('/:key', authorizeRoles('admin'), deleteSetting);

export default router;
