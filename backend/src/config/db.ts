import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { ShopSetting } from '../models/ShopSetting';
import { inMemoryCategories, inMemoryProducts } from '../services/inMemoryStore';

const autoSeedIfEmpty = async () => {
  try {
    // 1. Ensure Admin exists
    const adminPhone = '9876543210';
    let admin = await User.findOne({ phoneNumber: adminPhone });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin1234', salt);
      await User.create({
        phoneNumber: adminPhone,
        fullName: 'दुकानदार भाई (Ramesh Kumar - Owner)',
        role: 'admin',
        passwordHash,
        languagePreference: 'hi'
      });
      console.log(`[Auto-Init] Admin account initialized: 9876543210 / admin1234`);
    }

    // 2. Ensure Shop Settings exist
    const settingsCount = await ShopSetting.countDocuments();
    if (settingsCount === 0) {
      await ShopSetting.create({
        shopName: { en: 'Apna Bazar', hi: 'अपना बाज़ार' },
        contactPhone: '+919876543210',
        whatsappNumber: '+919876543210',
        defaultDeliveryFee: 20,
        freeDeliveryMinAmount: 499
      });
      console.log('[Auto-Init] Default shop settings initialized');
    }

    // 3. Ensure Categories & Products exist
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const insertedCats = await Category.insertMany(
        inMemoryCategories.map(c => ({
          name: c.name,
          slug: c.slug,
          description: c.description,
          iconName: c.iconName,
          displayOrder: c.displayOrder,
          isActive: true
        }))
      );

      const catMap: Record<string, any> = {};
      insertedCats.forEach(c => {
        catMap[c.slug] = c._id;
      });

      await Product.insertMany(
        inMemoryProducts.map(p => ({
          name: p.name,
          description: p.description,
          category: catMap[p.category.slug] || insertedCats[0]._id,
          sku: p.sku,
          price: p.price,
          salePrice: p.salePrice,
          stockQuantity: p.stockQuantity,
          lowStockThreshold: p.lowStockThreshold,
          unit: p.unit,
          images: p.images,
          isAvailable: true,
          isFeatured: p.isFeatured,
          tags: p.tags
        }))
      );
      console.log(`[Auto-Init] Initialized ${insertedCats.length} categories and grocery products in Atlas database`);
    }
  } catch (err) {
    console.warn('[Auto-Init] Error during database initialization:', (err as Error).message);
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    console.log(`[MongoDB] Connecting to: ${config.mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);

    // Auto-seed admin and initial catalogue if database is brand new
    await autoSeedIfEmpty();
  } catch (error) {
    // If Atlas connection fails (e.g. IP whitelist not set or bad connection), fall back cleanly to In-Memory
    mongoose.set('bufferCommands', false);
    console.warn(`----------------------------------------------------------------------`);
    console.warn(`[MongoDB Warning] Could not connect: ${(error as Error).message}`);
    console.warn(`> If using MongoDB Atlas, make sure you allowed IP Access (0.0.0.0/0) in Atlas Network Access.`);
    console.warn(`> [Auto-Fallback] In-Memory Data Store is ACTIVE so your app keeps working!`);
    console.warn(`> Admin Login: Phone: 9876543210, Password: admin1234`);
    console.warn(`----------------------------------------------------------------------`);
  }
};
