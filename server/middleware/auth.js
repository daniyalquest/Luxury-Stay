import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user owns the resource or has admin privileges
export const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Allow admins and managers to access all resources
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    // For guests, check if they own the resource
    if (req.user.role === 'guest') {
      const resourceId = req.params.id;
      const userId = req.user._id.toString();
      
      // This will be used in routes to check specific resource ownership
      req.checkOwnership = { userId, resourceId, resourceField };
    }

    next();
  };
};
