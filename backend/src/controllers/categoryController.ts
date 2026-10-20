import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { isMongoConnected, inMemoryCategories } from '../services/inMemoryStore';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      res.json({
        success: true,
        data: inMemoryCategories
      });
      return;
    }

    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
