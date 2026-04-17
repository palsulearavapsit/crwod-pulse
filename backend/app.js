/**
 * app.js — Express application factory.
 * Separated from server.js so tests can import the Express app without
 * starting the HTTP server or Socket.io (which keep Jest alive).
 *
 * Socket.io is only wired up in production/development mode.
 * Tests use the Express `app` directly via supertest.
 */
const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const IS_TEST = process.env.NODE_ENV === 'test';

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ── Rate Limiting (relaxed in tests to avoid 429s) ────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_TEST ? 10_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
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

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: IS_TEST ? true : allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(generalLimiter);

// ── Security Headers ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  // Force HTTPS in production only
  if (!IS_TEST && process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!IS_TEST) {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
      "connect-src 'self' https://www.google-analytics.com wss:",
      "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com",
      "frame-src https://maps.google.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
    ].join('; '));
  }
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
// Pass a no-op io object in test mode so routes don't call io.emit()
const mockIo = { emit: () => {}, to: () => ({ emit: () => {} }) };

let io = mockIo;

if (!IS_TEST) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  });
}

const apiRoutes = require('./routes/api')(io);
const aiRoutes  = require('./routes/ai');

app.use('/api',    apiRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/admin', adminLimiter);

// Health check
app.get('/health', (req, res) => res.json({
  status:    'ok',
  gemini:    !!process.env.GEMINI_API_KEY,
  env:       process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (!IS_TEST) console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Socket + Broadcast — only in non-test environments ────────────────────────
if (!IS_TEST) {
  const { state } = require('./data/mockState');
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients++;
    console.log(`[Socket] Connected: ${socket.id} (total: ${connectedClients})`);
    socket.emit('state:update', state);
    socket.on('disconnect', () => { connectedClients--; });
  });

  const broadcastInterval = setInterval(() => {
    if (connectedClients > 0) io.emit('state:update', state);
  }, 3000);
  broadcastInterval.unref?.();
}

module.exports = { app, server, io };
