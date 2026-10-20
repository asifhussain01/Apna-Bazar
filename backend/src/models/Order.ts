import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'COLLECTED' | 'FAILED';

export interface IOrderItemSnapshot {
  product: mongoose.Types.ObjectId;
  name: {
    en: string;
    hi: string;
  };
  sku: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  image: string;
  itemTotal: number;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note: string;
  updatedBy?: string; // "CUSTOMER" or Admin User ID/Name
}

export interface IOrder extends Document {
  orderNumber: string;
  customer?: mongoose.Types.ObjectId;
  isGuest: boolean;
  guestCustomerName?: string;
  guestPhoneNumber?: string;
  items: IOrderItemSnapshot[];
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
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'COD';
  paymentStatus: PaymentStatus;
  paymentCollectedAt?: Date;
  collectedBy?: string;
  orderStatus: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  shopkeeperName?: string;
  shopkeeperPhone?: string;
  assignedShopkeeper?: {
    id?: mongoose.Types.ObjectId;
    name: string;
    phoneNumber?: string;
    acceptedAt?: Date;
  };
  cancellationReason?: string;
  rejectionReason?: string;
  adminNotes?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    sku: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    image: { type: String, default: '' },
    itemTotal: { type: Number, required: true }
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED']
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    updatedBy: { type: String }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    guestCustomerName: { type: String, trim: true },
    guestPhoneNumber: { type: String, trim: true },
    items: {
      type: [OrderItemSnapshotSchema],
      required: true,
      validate: [(val: IOrderItemSnapshot[]) => val.length > 0, 'Order must contain at least one item']
    },
    deliveryAddress: {
      fullName: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      alternatePhone: { type: String, trim: true },
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      village: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      landmark: { type: String, required: true, trim: true },
      deliveryInstructions: { type: String, trim: true }
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['COD'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COLLECTED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    paymentCollectedAt: { type: Date },
    collectedBy: { type: String },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'],
      default: 'PLACED',
      index: true
    },
    statusHistory: [OrderStatusHistorySchema],
    shopkeeperName: { type: String, trim: true },
    shopkeeperPhone: { type: String, trim: true },
    assignedShopkeeper: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      acceptedAt: { type: Date }
    },
    cancellationReason: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    }
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'deliveryAddress.phoneNumber': 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
