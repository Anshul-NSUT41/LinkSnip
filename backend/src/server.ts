import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';
import { redirectUrl } from './controllers/urlController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ───────────────────────────────────────────────────

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Link-Password'],
  })
);

// Security headers
app.use(helmet());

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ──────────────────────────────────────────────────────────

// General API rate limit: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for URL creation: 30 URLs per 15 minutes
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many URLs created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limit: 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'URL Shortener API is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authLimiter, authRoutes);

// URL API routes
app.use('/api/url', apiLimiter, urlRoutes);

// Apply stricter rate limit to URL creation specifically
app.post('/api/url/shorten', createLimiter);

// Short URL redirect route (must be last to avoid catching API routes)
app.get('/:shortCode', redirectUrl);

// ─── Error Handling ─────────────────────────────────────────────────────────

// 404 handler for undefined API routes
app.use('/api', notFoundHandler);

// Global error handler
app.use(errorHandler);

// ─── Server Start ───────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║       🔗 URL Shortener API Server           ║
║                                              ║
║   Server:    http://localhost:${PORT}          ║
║   Env:       ${process.env.NODE_ENV || 'development'}                  ║
║   MongoDB:   Connected ✅                    ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
