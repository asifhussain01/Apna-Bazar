import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes default
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this device. Please try again after a few minutes.'
  }
});

// Stricter limiter for checkout and authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.'
  }
});

export const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20, // 20 orders per 5 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order requests. Please wait a moment before trying again.'
  }
});
