import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { AuditLog } from '../models/AuditLog';
import { OrderService } from '../services/orderService';
import { ExcelExportService } from '../services/excelExportService';
import { socketService } from '../services/socketService';
import {
  isMongoConnected,
  inMemoryOrders,
  inMemoryProducts,
  inMemoryCategories
} from '../services/inMemoryStore';

export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      const statusCounts: Record<string, number> = {
        PLACED: 0,
        CONFIRMED: 0,
        PREPARING: 0,
        SHIPPED: 0,
        OUT_FOR_DELIVERY: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        REJECTED: 0
      };

      let totalSales = 0;
      inMemoryOrders.forEach(o => {
        if (statusCounts[o.orderStatus] !== undefined) {
          statusCounts[o.orderStatus]++;
        }
        if (!['CANCELLED', 'REJECTED'].includes(o.orderStatus)) {
          totalSales += o.totalAmount;
        }
      });

      const lowStockProducts = inMemoryProducts.filter(
        p => p.stockQuantity <= p.lowStockThreshold
      );

      res.json({
        success: true,
        data: {
          totalOrders: inMemoryOrders.length,
          totalSales,
          totalProducts: inMemoryProducts.length,
          statusCounts,
          lowStockProducts,
          recentOrders: inMemoryOrders.slice(0, 6)
        }
      });
      return;
    }

    const [
      totalOrders,
      ordersByStatus,
      revenueResult,
      lowStockProducts,
      recentOrders,
      totalProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $nin: ['CANCELLED', 'REJECTED'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Product.find({
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
      })
        .select('name sku stockQuantity lowStockThreshold salePrice unit')
        .limit(15)
        .lean(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Product.countDocuments({ isAvailable: true })
    ]);

    const statusCounts: Record<string, number> = {
      PLACED: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REJECTED: 0
    };

    ordersByStatus.forEach(item => {
      if (item._id) statusCounts[item._id] = item.count;
    });

    const totalSales = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSales,
        totalProducts,
        statusCounts,
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      paymentStatus,
      page = '1',
      limit = '20'
    } = req.query;

    if (!isMongoConnected()) {
      let filtered = [...inMemoryOrders];
      if (status && status !== 'ALL') {
        filtered = filtered.filter(o => o.orderStatus === status);
      }
      if (paymentStatus && paymentStatus !== 'ALL') {
        filtered = filtered.filter(o => o.paymentStatus === paymentStatus);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          o =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.deliveryAddress?.fullName?.toLowerCase().includes(q) ||
            o.deliveryAddress?.phoneNumber?.includes(q) ||
            o.deliveryAddress?.village?.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        data: filtered,
        pagination: {
          page: 1,
          limit: 20,
          total: filtered.length,
          totalPages: 1
        }
      });
      return;
    }

    const query: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'ALL') {
      query.paymentStatus = paymentStatus;
    }

    if (search && typeof search === 'string') {
      const trimmed = search.trim();
      query.$or = [
        { orderNumber: { $regex: trimmed, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: trimmed, $options: 'i' } },
        { 'deliveryAddress.phoneNumber': { $regex: trimmed, $options: 'i' } },
        { 'deliveryAddress.village': { $regex: trimmed, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, rejectionReason, shopkeeperName: bodyShopkeeperName, shopkeeperPhone: bodyShopkeeperPhone } = req.body;
    const shopkeeperName = (bodyShopkeeperName && bodyShopkeeperName.trim()) || (req.user && req.user.fullName) || 'दुकानदार';
    const shopkeeperPhone = (bodyShopkeeperPhone && bodyShopkeeperPhone.trim()) || (req.user && req.user.phoneNumber) || '';

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o._id === id || o.orderNumber === id);
      if (order) {
        order.orderStatus = status;
        if (!order.shopkeeperName || status === 'CONFIRMED') {
          order.shopkeeperName = shopkeeperName;
          order.shopkeeperPhone = shopkeeperPhone;
          order.assignedShopkeeper = {
            id: req.user?._id,
            name: shopkeeperName,
            phoneNumber: shopkeeperPhone,
            acceptedAt: new Date()
          };
        }
        if (rejectionReason) order.rejectionReason = rejectionReason;
        const defaultNote = status === 'CONFIRMED'
          ? `दुकानदार ${shopkeeperName} ने आपका ऑर्डर स्वीकार कर लिया है`
          : (note || `Status updated to ${status}`);

        order.statusHistory.push({
          status,
          timestamp: new Date(),
          note: note || defaultNote,
          updatedBy: shopkeeperName
        });
        socketService.notifyOrderStatusChanged(order._id, order.customer, {
          orderId: order._id,
          orderNumber: order.orderNumber,
          newStatus: status,
          shopkeeperName: order.shopkeeperName,
          shopkeeperPhone: order.shopkeeperPhone,
          assignedShopkeeper: order.assignedShopkeeper,
          note: note || defaultNote,
          timestamp: new Date()
        });
      }
      res.json({ success: true, message: `Status updated to ${status}`, data: order });
      return;
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status as OrderStatus,
      req.userId || '',
      shopkeeperName,
      note,
      rejectionReason,
      shopkeeperPhone
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o._id === id || o.orderNumber === id);
      if (order) {
        order.paymentStatus = paymentStatus;
      }
      res.json({ success: true, message: `Payment status updated to ${paymentStatus}`, data: order });
      return;
    }

    const adminName = req.user ? req.user.fullName : 'Admin';
    const updatedOrder = await OrderService.updatePaymentStatus(id, paymentStatus, adminName);

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const addAdminNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o._id === id);
      if (order) order.adminNotes = adminNotes;
      res.json({ success: true, data: order });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { adminNotes },
      { new: true }
    );

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const exportOrdersExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    let ordersToExport: any[] = [];
    if (!isMongoConnected()) {
      ordersToExport = inMemoryOrders;
      if (status && status !== 'ALL') {
        ordersToExport = ordersToExport.filter(o => o.orderStatus === status);
      }
    } else {
      const query: any = {};
      if (status && typeof status === 'string' && status !== 'ALL') {
        query.orderStatus = status;
      }
      ordersToExport = await Order.find(query).sort({ createdAt: -1 }).lean();
    }

    const excelBuffer = await ExcelExportService.generateOrdersExcel(ordersToExport as any);

    const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `Apna_Bazar_Orders_${dateTag}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ---------------- Product Management ----------------
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      const newProd = {
        _id: `mem_prod_${Date.now()}`,
        ...req.body
      };
      inMemoryProducts.push(newProd);
      res.status(201).json({ success: true, data: newProd });
      return;
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const idx = inMemoryProducts.findIndex(p => p._id === id);
      if (idx > -1) {
        inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...req.body };
        res.json({ success: true, data: inMemoryProducts[idx] });
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const idx = inMemoryProducts.findIndex(p => p._id === id);
      if (idx > -1) {
        inMemoryProducts.splice(idx, 1);
      }
      res.json({ success: true, message: 'Product deleted' });
      return;
    }

    await Product.findByIdAndUpdate(id, { isAvailable: false }, { new: true });
    res.json({ success: true, message: 'Product marked as inactive' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      const newCat = { _id: `mem_cat_${Date.now()}`, ...req.body };
      inMemoryCategories.push(newCat);
      res.status(201).json({ success: true, data: newCat });
      return;
    }
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isMongoConnected()) {
      const idx = inMemoryCategories.findIndex(c => c._id === id);
      if (idx > -1) {
        inMemoryCategories[idx] = { ...inMemoryCategories[idx], ...req.body };
        res.json({ success: true, data: inMemoryCategories[idx] });
        return;
      }
    }
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ success: true, data: [] });
};
