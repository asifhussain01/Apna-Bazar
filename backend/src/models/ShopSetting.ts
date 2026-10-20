import mongoose, { Document, Schema } from 'mongoose';

export interface IShopSetting extends Document {
  shopName: {
    en: string;
    hi: string;
  };
  contactPhone: string;
  whatsappNumber: string;
  address: {
    en: string;
    hi: string;
  };
  supportHours: {
    en: string;
    hi: string;
  };
  defaultDeliveryFee: number;
  freeDeliveryMinAmount: number;
  announcement: {
    en: string;
    hi: string;
    isActive: boolean;
  };
  bannerImages: string[];
  updatedAt: Date;
}

const ShopSettingSchema = new Schema<IShopSetting>(
  {
    shopName: {
      en: { type: String, default: 'ShopEase - Apna Bazar' },
      hi: { type: String, default: 'शॉपईज़ - अपना बाज़ार' }
    },
    contactPhone: { type: String, default: '+919876543210' },
    whatsappNumber: { type: String, default: '+919876543210' },
    address: {
      en: { type: String, default: 'Main Market, Near Gram Panchayat Bhawan' },
      hi: { type: String, default: 'मुख्य बाज़ार, ग्राम पंचायत भवन के पास' }
    },
    supportHours: {
      en: { type: String, default: '8:00 AM - 8:00 PM (Monday to Sunday)' },
      hi: { type: String, default: 'सुबह 8:00 बजे से शाम 8:00 बजे तक (सोमवार से रविवार)' }
    },
    defaultDeliveryFee: { type: Number, default: 20 },
    freeDeliveryMinAmount: { type: Number, default: 499 },
    announcement: {
      en: { type: String, default: 'Fast village delivery within 2-4 hours!' },
      hi: { type: String, default: 'आपके गाँव में 2 से 4 घंटे के भीतर तेज़ डिलीवरी!' },
      isActive: { type: Boolean, default: true }
    },
    bannerImages: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  },
  { timestamps: true }
);

export const ShopSetting = mongoose.model<IShopSetting>('ShopSetting', ShopSettingSchema);
