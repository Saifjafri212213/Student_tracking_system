import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.js';

/**
 * Generate a signed JWT token for a user
 * @param {Object} user 
 * @returns {string} token
 */
export function generateToken(user) {
  const payload = {
    uid: user.uid,
    email: user.email,
    rollNumber: user.rollNumber,
    fullName: user.fullName,
    branch: user.branch,
    academicYear: user.academicYear
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '7d'
  });
}

/**
 * Express middleware to enforce JWT authentication
 */
export async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid or malformed authentication token.' });
  }
}

/**
 * Express middleware for optional JWT (if token provided, decode and attach user; otherwise proceed)
 */
export function optionalAuthenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}
