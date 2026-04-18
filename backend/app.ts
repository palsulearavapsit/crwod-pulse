import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import helmet from 'helmet';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const IS_TEST = process.env.NODE_ENV === 'test';
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// ── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_TEST ? 10_000 : 300,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => IS_TEST,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: IS_TEST ? 10_000 : 30,
  message: { error: 'AI rate limit reached. Please wait a moment.' },
  skip: () => IS_TEST,
});

const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: IS_TEST ? 10_000 : 100,
  message: { error: 'Admin rate limit reached.' },
  skip: () => IS_TEST,
});


// ── Middleware ────────────────────────────────────────────────────────────
app.use(compression());
app.use(cors({ origin: IS_TEST ? true : allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    connectSrc: ["'self'", "https://www.google-analytics.com", "wss:", "https://firebaselogging.googleapis.com"],
    imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com"],
    frameSrc: ["https://maps.google.com", "https://www.google.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
  },
}));

// Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!IS_TEST) {
    logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming Request');
  }
  next();
});

// ── Socket.io Setup ────────────────────────────────────────────────────────
const mockIo = { emit: () => {}, to: () => ({ emit: () => {} }) } as any;
let io: Server | typeof mockIo = mockIo;

if (!IS_TEST) {
  io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  });
}

// ── Routes ─────────────────────────────────────────────────────────────────
import apiRoutesFactory from './routes/api';
import aiRoutes from './routes/ai';

app.use('/api', generalLimiter, apiRoutesFactory(io));
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/admin', adminLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => res.json({
  status: 'ok',
  gemini: !!process.env.GEMINI_API_KEY,
  env: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

// 404 handler
app.use((req: Request, res: Response) => res.status(404).json({ error: 'Endpoint not found.' }));

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (!IS_TEST) logger.error({ err }, 'Server Error');
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ error: message });
});

// ── Socket Loop ────────────────────────────────────────────────────────────
if (!IS_TEST && io instanceof Server) {
  const { state } = require('./data/venueState');
  let connectedClients = 0;
  let pendingUpdate = false;

  io.on('connection', (socket) => {
    connectedClients++;
    logger.info({ socketId: socket.id, total: connectedClients }, '[Socket] Client Connected');
    socket.emit('state:update', state);
    socket.on('disconnect', () => { 
      connectedClients--; 
      logger.info({ socketId: socket.id, total: connectedClients }, '[Socket] Client Disconnected');
    });
  });

  const broadcastInterval = setInterval(() => {
    if (connectedClients > 0 && pendingUpdate) {
      io.emit('state:update', state);
      pendingUpdate = false;
    }
  }, 500);
  (broadcastInterval as any).unref?.();

  app.set('triggerUpdate', () => {
    pendingUpdate = true;
  });
} else {
  app.set('triggerUpdate', () => {});
}

export { app, server, io };
