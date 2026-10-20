import { Request, Response } from 'express';
import { ShopSetting } from '../models/ShopSetting';
import { AuthRequest } from '../middleware/auth';
import { isMongoConnected, inMemorySettings } from '../services/inMemoryStore';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      res.json({ success: true, data: inMemorySettings });
      return;
    }

    let settings = await ShopSetting.findOne();
    if (!settings) {
      settings = await ShopSetting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      Object.assign(inMemorySettings, req.body);
      res.json({ success: true, data: inMemorySettings });
      return;
    }

    let settings = await ShopSetting.findOne();
    if (!settings) {
      settings = new ShopSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
