import express from 'express';
import {
  registerUser,
  getUsers,
  loginUser,
  getUserById,
  deleteUser,
  updateUser
} from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'manager', 'receptionist'), getUsers);
router.get('/:id', getUserById); // Users can access their own profile
router.put('/:id', updateUser); // Users can update their own profile, admins can update any
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteUser);

export default router;
