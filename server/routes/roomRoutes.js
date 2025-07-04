import express from 'express';
import {
  createRoom,
  getRooms,
  updateRoomStatus,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route for viewing rooms (guests can see available rooms)
router.get('/', getRooms);

// Protected routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager'), createRoom);
router.patch('/:id/status', authorizeRoles('admin', 'manager', 'receptionist', 'housekeeping'), updateRoomStatus);
router.put('/:id', authorizeRoles('admin', 'manager'), updateRoom);
router.delete('/:id', authorizeRoles('admin'), deleteRoom);

export default router;