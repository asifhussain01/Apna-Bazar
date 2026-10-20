import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus, IOrderItemSnapshot } from '../models/Order';
import { Product } from '../models/Product';
import { ShopSetting } from '../models/ShopSetting';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { socketService } from './socketService';
import { PushService } from './pushService';

export interface CreateOrderInput {
  customerId?: string;
  isGuest: boolean;
  guestCustomerName?: string;
  guestPhoneNumber?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    alternatePhone?: string;
    state: string;
    district: string;
    village: string;
    pincode: string;
    landmark: string;
    deliveryInstructions?: string;
  };
  idempotencyKey?: string;
}

export class OrderService {
  // Allowed state machine transitions
  private static VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
    REJECTED: []
  };

  /**
   * Create a new order with atomic inventory reservation and idempotency guarantee
   */
  public static async createOrder(input: CreateOrderInput): Promise<IOrder> {
    // 1. Check idempotency key to prevent duplicate orders
    if (input.idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey });
      if (existing) {
        console.log(`[OrderService] Duplicate submission detected for key: ${input.idempotencyKey}. Returning existing.`);
        return existing;
      }
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // 2. Fetch current Shop Settings for delivery fee thresholds
    let settings = await ShopSetting.findOne();
    if (!settings) {
      settings = await ShopSetting.create({});
    }

    // 3. Atomically reserve inventory & assemble order item snapshots
    const reservedItems: Array<{ productId: string; quantity: number }> = [];
    const itemSnapshots: IOrderItemSnapshot[] = [];
    let calculatedSubtotal = 0;

    try {
      for (const itemInput of input.items) {
        if (itemInput.quantity <= 0) {
          throw new Error('Quantity must be greater than zero');
        }

        // Atomically decrement stock only if available stock >= requested quantity
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: itemInput.productId,
            isAvailable: true,
            stockQuantity: { $gte: itemInput.quantity }
          },
          {
            $inc: { stockQuantity: -itemInput.quantity }
          },
          { new: true }
        );

        if (!updatedProduct) {
          const productDoc = await Product.findById(itemInput.productId);
          const productName = productDoc ? productDoc.name.hi || productDoc.name.en : 'Item';
          throw new Error(`अपर्याप्त स्टॉक (Insufficient stock for "${productName}")`);
        }

        reservedItems.push({
          productId: itemInput.productId,
          quantity: itemInput.quantity
        });

        // Check if low stock reached
        if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
          socketService.notifyLowStock({
            productId: updatedProduct._id,
            name: updatedProduct.name,
            sku: updatedProduct.sku,
            remainingStock: updatedProduct.stockQuantity
          });
        }

        const unitPrice = updatedProduct.salePrice;
        const itemTotal = unitPrice * itemInput.quantity;
        calculatedSubtotal += itemTotal;

        itemSnapshots.push({
          product: updatedProduct._id as mongoose.Types.ObjectId,
          name: {
            en: updatedProduct.name.en,
            hi: updatedProduct.name.hi
          },
          sku: updatedProduct.sku,
          unitPrice,
          quantity: itemInput.quantity,
          unit: updatedProduct.unit,
          image: updatedProduct.images && updatedProduct.images.length > 0 ? updatedProduct.images[0] : '',
          itemTotal
        });
      }
    } catch (err) {
      // Rollback any reserved stock on failure
      for (const res of reservedItems) {
        await Product.findByIdAndUpdate(res.productId, {
          $inc: { stockQuantity: res.quantity }
        });
      }
      throw err;
    }

    // 4. Calculate Delivery Charges
    const deliveryCharge =
      calculatedSubtotal >= settings.freeDeliveryMinAmount ? 0 : settings.defaultDeliveryFee;
    const totalAmount = calculatedSubtotal + deliveryCharge;

    // 5. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AB-${dateStr}-${randomSuffix}`;

    // 6. Create Order Document
    const order = new Order({
      orderNumber,
      customer: input.customerId ? new mongoose.Types.ObjectId(input.customerId) : undefined,
      isGuest: input.isGuest,
      guestCustomerName: input.guestCustomerName,
      guestPhoneNumber: input.guestPhoneNumber,
      items: itemSnapshots,
      deliveryAddress: input.deliveryAddress,
      subtotal: calculatedSubtotal,
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
          updatedBy: input.isGuest ? 'GUEST' : 'CUSTOMER'
        }
      ],
      idempotencyKey: input.idempotencyKey
    });

    await order.save();

    // 7. Create Persistent Notifications
    // Admin notification
    await Notification.create({
      targetRole: 'ADMIN',
      title: {
        en: `New Order #${order.orderNumber}`,
        hi: `नया ऑर्डर प्राप्त हुआ #${order.orderNumber}`
      },
      body: {
        en: `Order of ₹${order.totalAmount} received for ${order.deliveryAddress.village}, ${order.deliveryAddress.district}`,
        hi: `${order.deliveryAddress.village}, ${order.deliveryAddress.district} से ₹${order.totalAmount} का नया ऑर्डर आया है`
      },
      type: 'ORDER_PLACED',
      orderId: order._id,
      orderNumber: order.orderNumber
    });

    // Customer notification
    if (input.customerId) {
      await Notification.create({
        recipientUser: new mongoose.Types.ObjectId(input.customerId),
        targetRole: 'CUSTOMER',
        title: {
          en: `Order Confirmed #${order.orderNumber}`,
          hi: `ऑर्डर दर्ज हुआ #${order.orderNumber}`
        },
        body: {
          en: `Your order for ₹${order.totalAmount} has been received and is waiting for shopkeeper confirmation.`,
          hi: `आपका ₹${order.totalAmount} का ऑर्डर दर्ज हो गया है। जल्द ही दुकानदार द्वारा पुष्टि की जाएगी।`
        },
        type: 'ORDER_PLACED',
        orderId: order._id,
        orderNumber: order.orderNumber
      });

      // Send push notification if token exists
      const user = await User.findById(input.customerId);
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        PushService.sendPushNotifications(
          user.pushTokens,
          `ऑर्डर प्राप्त हुआ #${order.orderNumber}`,
          `₹${order.totalAmount} का सामान आपके गाँव ${order.deliveryAddress.village} में डिलीवरी के लिए तैयार किया जा रहा है।`,
          { orderId: order._id.toString() }
        );
      }
    }

    // 8. Emit Real-time Socket Event to Shopkeeper
    socketService.notifyNewOrder({
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: order.deliveryAddress.fullName,
      village: order.deliveryAddress.village,
      itemsCount: order.items.length,
      createdAt: order.createdAt
    });

    return order;
  }

  /**
   * Update order status with valid state transitions and inventory release on cancellation
   */
  public static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    adminName: string,
    note?: string,
    rejectionReason?: string,
    adminPhone?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const currentStatus = order.orderStatus;
    const allowedTransitions = this.VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status change from "${currentStatus}" to "${newStatus}". Permitted next statuses: ${allowedTransitions.join(', ') || 'None'}`
      );
    }

    // If order is cancelled or rejected, release reserved inventory back to product stock
    if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity }
        });
      }
    }

    order.orderStatus = newStatus;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    if (newStatus === 'CANCELLED' && note) order.cancellationReason = note;

    // Assign shopkeeper when order is grabbed / confirmed
    if (!order.shopkeeperName || newStatus === 'CONFIRMED') {
      order.shopkeeperName = adminName;
      if (adminPhone) {
        order.shopkeeperPhone = adminPhone;
      }
      order.assignedShopkeeper = {
        id: adminId && mongoose.isValidObjectId(adminId) ? new mongoose.Types.ObjectId(adminId) : undefined,
        name: adminName,
        phoneNumber: adminPhone,
        acceptedAt: new Date()
      };
    }

    const defaultNotes: Record<OrderStatus, string> = {
      PLACED: 'ऑर्डर दर्ज हुआ',
      CONFIRMED: `दुकानदार ${adminName} ने आपका ऑर्डर स्वीकार कर लिया है`,
      PREPARING: `दुकानदार ${adminName} द्वारा सामान पैक किया जा रहा है`,
      SHIPPED: 'डिलीवरी के लिए रवाना कर दिया गया (Dispatched for village delivery)',
      OUT_FOR_DELIVERY: 'डिलीवरी बॉय आपके गाँव के पास है (Out for delivery)',
      DELIVERED: 'सफलतापूर्वक डिलीवर हुआ (Delivered successfully to customer)',
      CANCELLED: note || 'ऑर्डर रद्द कर दिया गया (Order cancelled)',
      REJECTED: rejectionReason || `दुकानदार ${adminName} द्वारा ऑर्डर अस्वीकार किया गया`
    };

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note || defaultNotes[newStatus],
      updatedBy: adminName || 'ADMIN'
    });

    await order.save();

    // Notify customer via DB notification and Socket
    const localizedTitle: Record<OrderStatus, { en: string; hi: string }> = {
      PLACED: { en: 'Order Placed', hi: 'ऑर्डर दर्ज हुआ' },
      CONFIRMED: { en: `Order Confirmed by ${adminName}`, hi: `दुकानदार ${adminName} ने स्वीकार किया` },
      PREPARING: { en: 'Packing Order', hi: 'सामान पैक हो रहा है' },
      SHIPPED: { en: 'Order Dispatched', hi: 'ऑर्डर रवाना हुआ' },
      OUT_FOR_DELIVERY: { en: 'Out for Delivery', hi: 'डिलीवरी के लिए निकला' },
      DELIVERED: { en: 'Order Delivered', hi: 'ऑर्डर डिलीवर हो गया' },
      CANCELLED: { en: 'Order Cancelled', hi: 'ऑर्डर रद्द हुआ' },
      REJECTED: { en: 'Order Rejected', hi: 'ऑर्डर अस्वीकार हुआ' }
    };

    if (order.customer) {
      await Notification.create({
        recipientUser: order.customer,
        targetRole: 'CUSTOMER',
        title: localizedTitle[newStatus],
        body: {
          en: `Order #${order.orderNumber}: ${defaultNotes[newStatus]}`,
          hi: `ऑर्डर #${order.orderNumber}: ${defaultNotes[newStatus]}`
        },
        type: newStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_STATUS_UPDATE',
        orderId: order._id,
        orderNumber: order.orderNumber
      });

      // Push notification
      const user = await User.findById(order.customer);
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        PushService.sendPushNotifications(
          user.pushTokens,
          `ऑर्डर #${order.orderNumber}: ${localizedTitle[newStatus].hi}`,
          defaultNotes[newStatus],
          { orderId: order._id.toString() }
        );
      }
    }

    // Socket update to customer and admin
    socketService.notifyOrderStatusChanged(
      order._id.toString(),
      order.customer ? order.customer.toString() : undefined,
      {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus,
        shopkeeperName: order.shopkeeperName || adminName,
        shopkeeperPhone: order.shopkeeperPhone || adminPhone,
        assignedShopkeeper: order.assignedShopkeeper,
        note: note || defaultNotes[newStatus],
        timestamp: new Date()
      }
    );

    return order;
  }

  /**
   * Update COD payment collection status
   */
  public static async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'COLLECTED' | 'FAILED' | 'PENDING',
    adminName: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'COLLECTED') {
      order.paymentCollectedAt = new Date();
      order.collectedBy = adminName;
    }

    await order.save();
    return order;
  }
}
