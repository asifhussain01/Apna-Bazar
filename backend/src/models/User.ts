import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IVillageAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  landmark: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  phoneNumber: string;
  fullName: string;
  role: 'customer' | 'admin';
  passwordHash?: string;
  languagePreference: 'en' | 'hi';
  addresses: IVillageAddress[];
  pushTokens: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const VillageAddressSchema = new Schema<IVillageAddress>({
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  state: { type: String, required: true, trim: true, default: 'Uttar Pradesh' },
  district: { type: String, required: true, trim: true },
  village: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  landmark: { type: String, required: true, trim: true }, // e.g., "Near Shiv Mandir", "Behind Panchayat Bhawan"
  deliveryInstructions: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    languagePreference: {
      type: String,
      enum: ['en', 'hi'],
      default: 'hi'
    },
    addresses: [VillageAddressSchema],
    pushTokens: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Encrypt password before saving if modified
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
