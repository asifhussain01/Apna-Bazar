import { Router } from 'express';
import {
  getDashboardMetrics,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  addAdminNote,
  exportOrdersExcel,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  getAuditLogs
} from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticateUser, requireAdmin);

// Dashboard metrics
router.get('/dashboard', getDashboardMetrics);

// Order management
router.get('/orders', getOrders);
router.get('/orders/export-excel', exportOrdersExcel);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updatePaymentStatus);
router.put('/orders/:id/notes', addAdminNote);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

// Audit logs
router.get('/audit-logs', getAuditLogs);

export default router;
