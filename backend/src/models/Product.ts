import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  category: mongoose.Types.ObjectId;
  sku: string;
  price: number; // MRP
  salePrice: number; // Current selling price
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string; // e.g. "1 kg", "500 g", "1 L", "1 Pack"
  images: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true }
    },
    description: {
      en: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true }
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    unit: {
      type: String,
      required: true,
      default: '1 unit'
    },
    images: {
      type: [String],
      default: []
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

// Text index for search across both English and Hindi names
ProductSchema.index({
  'name.en': 'text',
  'name.hi': 'text',
  tags: 'text',
  sku: 'text'
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
