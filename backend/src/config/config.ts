import dotenv from 'dotenv';
dotenv.config();

// Automatically clean angle brackets if copied directly from Atlas template: <username>:<password> -> username:password
const rawMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna_bazar';
let cleanMongoUri = rawMongoUri.replace(/<([^>]+)>/g, '$1').trim();

// Ensure database name is included if URI ends with / or hostname
if (cleanMongoUri.endsWith('.mongodb.net/')) {
  cleanMongoUri = `${cleanMongoUri}apna_bazar?retryWrites=true&w=majority`;
} else if (cleanMongoUri.endsWith('.mongodb.net')) {
  cleanMongoUri = `${cleanMongoUri}/apna_bazar?retryWrites=true&w=majority`;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: cleanMongoUri,
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_key_123456789!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  clientUrl: process.env.CLIENT_URL || '*',
  adminUrl: process.env.ADMIN_URL || '*',
  shopName: process.env.SHOP_NAME || 'Apna Bazar',
  shopPhone: process.env.SHOP_PHONE || '+919876543210',
  shopWhatsapp: process.env.SHOP_WHATSAPP || '+919876543210',
  defaultDeliveryFee: parseFloat(process.env.DEFAULT_DELIVERY_FEE || '20'),
  freeDeliveryMinAmount: parseFloat(process.env.FREE_DELIVERY_MIN_AMOUNT || '499'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10)
};
