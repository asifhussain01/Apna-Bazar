import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { connectDB } from './config/db';
import { socketService } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.io
socketService.init(server, [config.clientUrl, config.adminUrl, 'http://localhost:5173', 'http://localhost:3000', '*']);

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow mobile apps and web admin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Apna Bazar API'
  });
});

// Root welcome route for deployment verification
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🚀 Apna Bazar (अपना बाज़ार) API Server is live and running!',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      admin: '/api/admin',
      auth: '/api/auth',
      settings: '/api/settings'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product', productRoutes); // alias for singular
app.use('/api/categories', categoryRoutes);
app.use('/api/category', categoryRoutes); // alias for singular
app.use('/api/orders', orderRoutes);
app.use('/api/order', orderRoutes); // alias for singular
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`
  });
});

// Central Error Handler
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 Apna Bazar (ShopEase) Server running!`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`===============================================`);
});

export { app, server };
