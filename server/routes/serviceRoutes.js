import express from 'express';
import {
  createServiceRequest,
  getServiceRequestsByBooking,
  updateServiceStatus
} from '../controllers/serviceController.js';

const router = express.Router();

router.post('/', createServiceRequest);
router.get('/booking/:bookingId', getServiceRequestsByBooking);
router.patch('/:id/status', updateServiceStatus);

export default router;
