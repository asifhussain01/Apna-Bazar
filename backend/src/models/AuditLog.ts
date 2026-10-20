import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: string;
  targetType: 'ORDER' | 'PRODUCT' | 'CATEGORY' | 'SETTINGS' | 'USER';
  targetId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['ORDER', 'PRODUCT', 'CATEGORY', 'SETTINGS', 'USER'],
      required: true
    },
    targetId: {
      type: String
    },
    details: {
      type: Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
