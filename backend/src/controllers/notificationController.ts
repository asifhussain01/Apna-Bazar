import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { isMongoConnected, inMemoryNotifications } from '../services/inMemoryStore';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      res.json({
        success: true,
        data: inMemoryNotifications,
        unreadCount: inMemoryNotifications.filter(n => !n.isRead).length
      });
      return;
    }

    const query: any = {};

    if (req.userRole === 'admin') {
      query.$or = [{ targetRole: 'ADMIN' }, { targetRole: 'ALL' }];
    } else if (req.userId) {
      query.$or = [{ recipientUser: req.userId }, { targetRole: 'ALL' }];
    } else {
      res.json({ success: true, data: [], unreadCount: 0 });
      return;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ ...query, isRead: false })
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isMongoConnected()) {
      const n = inMemoryNotifications.find(item => item._id === id);
      if (n) n.isRead = true;
      res.json({ success: true, message: 'Notification marked as read' });
      return;
    }
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      inMemoryNotifications.forEach(n => (n.isRead = true));
      res.json({ success: true, message: 'All notifications marked as read' });
      return;
    }

    const query: any = { isRead: false };
    if (req.userRole === 'admin') {
      query.$or = [{ targetRole: 'ADMIN' }, { targetRole: 'ALL' }];
    } else if (req.userId) {
      query.recipientUser = req.userId;
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
