import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_CANCELLED'
  | 'LOW_STOCK'
  | 'SYSTEM_ALERT';

export interface INotification extends Document {
  recipientUser?: mongoose.Types.ObjectId;
  targetRole: 'CUSTOMER' | 'ADMIN' | 'ALL';
  title: {
    en: string;
    hi: string;
  };
  body: {
    en: string;
    hi: string;
  };
  type: NotificationType;
  orderId?: mongoose.Types.ObjectId;
  orderNumber?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    targetRole: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN', 'ALL'],
      default: 'CUSTOMER',
      index: true
    },
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    body: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    type: {
      type: String,
      enum: ['ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_STATUS_UPDATE', 'ORDER_CANCELLED', 'LOW_STOCK', 'SYSTEM_ALERT'],
      required: true,
      index: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientUser: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ targetRole: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
