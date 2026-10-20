import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController';
import { optionalAuth, authenticateUser } from '../middleware/auth';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

// Guest or registered user can place order
router.post('/', orderLimiter, optionalAuth, createOrder);

// Retrieve orders (customer orders by phone / session or list)
router.get('/', optionalAuth, getMyOrders);

// Retrieve my orders (authenticated user or query with phone number)
router.get('/my-orders', optionalAuth, getMyOrders);

// View order status and details
router.get('/:id', optionalAuth, getOrderById);

// Customer cancel order (within allowed stages)
router.post('/:id/cancel', optionalAuth, cancelOrder);

export default router;
