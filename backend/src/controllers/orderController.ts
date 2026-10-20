import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { socketService } from '../services/socketService';
import {
  isMongoConnected,
  inMemoryOrders,
  inMemoryProducts,
  inMemorySettings,
  inMemoryNotifications
} from '../services/inMemoryStore';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddress, guestName, guestPhone } = req.body;
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items are required' });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phoneNumber || !deliveryAddress.village) {
      res.status(400).json({
        success: false,
        message: 'Complete village delivery address is required (Name, Mobile, Village)'
      });
      return;
    }

    if (!isMongoConnected()) {
      // In-Memory Order Processing
      let subtotal = 0;
      const orderItems = items.map((it: any) => {
        const prod = inMemoryProducts.find(p => p._id === it.productId) || inMemoryProducts[0];
        const itemTotal = prod.salePrice * it.quantity;
        subtotal += itemTotal;
        return {
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: prod.salePrice,
          quantity: it.quantity,
          unit: prod.unit,
          image: prod.images?.[0] || '',
          itemTotal
        };
      });

      const deliveryCharge = subtotal >= inMemorySettings.freeDeliveryMinAmount ? 0 : inMemorySettings.defaultDeliveryFee;
      const totalAmount = subtotal + deliveryCharge;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AB-${dateStr}-${randomSuffix}`;

      const newOrder = {
        _id: `mem_ord_${Date.now()}`,
        orderNumber,
        isGuest: !req.userId,
        customer: req.userId,
        items: orderItems,
        deliveryAddress,
        subtotal,
        deliveryCharge,
        discount: 0,
        totalAmount,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        statusHistory: [
          {
            status: 'PLACED',
            timestamp: new Date(),
            note: 'ऑर्डर सफलतापूर्वक दर्ज किया गया (Order placed successfully via COD)',
            updatedBy: req.userId ? 'CUSTOMER' : 'GUEST'
          }
        ],
        createdAt: new Date()
      };

      inMemoryOrders.unshift(newOrder);

      // Add to in-memory notifications
      inMemoryNotifications.unshift({
        _id: `mem_notif_${Date.now()}`,
        targetRole: 'ADMIN',
        title: { en: `New Order #${newOrder.orderNumber}`, hi: `नया ऑर्डर प्राप्त हुआ #${newOrder.orderNumber}` },
        body: {
          en: `Order of ₹${newOrder.totalAmount} for ${newOrder.deliveryAddress.village}`,
          hi: `${newOrder.deliveryAddress.village} से ₹${newOrder.totalAmount} का नया ऑर्डर आया है`
        },
        type: 'ORDER_PLACED',
        orderNumber: newOrder.orderNumber,
        isRead: false,
        createdAt: new Date()
      });

      // Socket emit
      socketService.notifyNewOrder({
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        customerName: newOrder.deliveryAddress.fullName,
        village: newOrder.deliveryAddress.village,
        itemsCount: newOrder.items.length,
        createdAt: newOrder.createdAt
      });

      res.status(201).json({
        success: true,
        message: 'ऑर्डर सफलतापूर्वक दर्ज हो गया है (Order placed successfully)',
        data: newOrder
      });
      return;
    }

    const isGuest = !req.userId;

    const order = await OrderService.createOrder({
      customerId: req.userId,
      isGuest,
      guestCustomerName: isGuest ? guestName || deliveryAddress.fullName : undefined,
      guestPhoneNumber: isGuest ? guestPhone || deliveryAddress.phoneNumber : undefined,
      items,
      deliveryAddress,
      idempotencyKey
    });

    res.status(201).json({
      success: true,
      message: 'ऑर्डर सफलतापूर्वक दर्ज हो गया है (Order placed successfully)',
      data: order
    });
  } catch (error) {
    console.error('[CreateOrder Error]', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message || 'Failed to place order'
    });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone } = req.query;

    if (!isMongoConnected()) {
      let filtered = inMemoryOrders;
      const cleanPhone = typeof phone === 'string' ? phone.replace(/[^0-9]/g, '').slice(-10) : '';

      if (cleanPhone || req.userId) {
        const matches = inMemoryOrders.filter(o => {
          const matchUser = req.userId && String(o.customer) === String(req.userId);
          const ordPhone = (o.deliveryAddress?.phoneNumber || o.guestPhoneNumber || '').replace(/[^0-9]/g, '').slice(-10);
          const matchPhone = cleanPhone && ordPhone === cleanPhone;
          return matchUser || matchPhone;
        });
        if (matches.length > 0) {
          filtered = matches;
        }
      }

      res.json({ success: true, data: filtered });
      return;
    }

    const conditions: any[] = [];

    if (req.userId) {
      conditions.push({ customer: req.userId });
      try {
        const u = await User.findById(req.userId).lean();
        if (u && u.phoneNumber) {
          const uPhone = u.phoneNumber.replace(/[^0-9]/g, '').slice(-10);
          conditions.push({ 'deliveryAddress.phoneNumber': uPhone });
          conditions.push({ guestPhoneNumber: uPhone });
        }
      } catch (e) {}
    }

    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      conditions.push({ 'deliveryAddress.phoneNumber': cleanPhone });
      conditions.push({ guestPhoneNumber: cleanPhone });
    }

    const query = conditions.length > 0 ? { $or: conditions } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o._id === id || o.orderNumber === id) || inMemoryOrders[0];
      res.json({ success: true, data: order });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o._id === id);
      if (order) {
        order.orderStatus = 'CANCELLED';
        order.cancellationReason = reason || 'Cancelled by customer';
        order.statusHistory.push({
          status: 'CANCELLED',
          timestamp: new Date(),
          note: reason || 'Cancelled by customer',
          updatedBy: 'CUSTOMER'
        });
      }
      res.json({ success: true, message: 'ऑर्डर रद्द कर दिया गया है', data: order });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const updated = await OrderService.updateOrderStatus(
      id,
      'CANCELLED',
      req.userId || 'CUSTOMER',
      req.user ? req.user.fullName : 'Customer',
      reason || 'Cancelled by customer'
    );

    res.json({
      success: true,
      message: 'ऑर्डर रद्द कर दिया गया है (Order has been cancelled)',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
