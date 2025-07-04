import express from 'express';
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  checkInGuest,
  checkOutGuest,
  getBookingsByDateRange,
  getAvailableRooms
} from '../controllers/bookingController.js';
import { authenticateToken, authorizeRoles, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager', 'receptionist', 'guest'), createBooking);
router.get('/', authorizeRoles('admin', 'manager', 'receptionist'), getAllBookings);
router.get('/my', getMyBookings);
router.get('/available-rooms', getAvailableRooms);
router.get('/date-range', authorizeRoles('admin', 'manager', 'receptionist'), getBookingsByDateRange);
router.get('/:id', checkOwnership(), getBookingById);
router.put('/:id', checkOwnership(), updateBooking);
router.patch('/:id/status', authorizeRoles('admin', 'manager', 'receptionist'), updateBookingStatus);
router.patch('/:id/checkin', authorizeRoles('admin', 'manager', 'receptionist'), checkInGuest);
router.patch('/:id/checkout', authorizeRoles('admin', 'manager', 'receptionist'), checkOutGuest);
router.delete('/:id', checkOwnership(), deleteBooking);

export default router;
