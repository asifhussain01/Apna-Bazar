import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: {
    en: string;
    hi: string;
  };
  slug: string;
  description?: {
    en: string;
    hi: string;
  };
  iconName: string; // Ionicons / MaterialCommunityIcons identifier
  image: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true }
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true }
    },
    iconName: {
      type: String,
      default: 'basket'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
