/**
 * app.js — Express application factory.
 * Separated from server.js so tests can import it without starting the server.
 */
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ── Socket.io ──────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

// ── Rate Limiting ──────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' } });

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30,
  message: { error: 'AI rate limit reached. Please wait a moment.' } });

const adminLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100,
  message: { error: 'Admin rate limit reached.' } });

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(generalLimiter);

// ── Security Headers ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com wss:",
    "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com",
    "frame-src https://maps.google.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
  ].join('; '));

  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
const apiRoutes = require('./routes/api')(io);
const aiRoutes  = require('./routes/ai');

app.use('/api',    apiRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Rate-limit admin separately (already handled inside apiRoutes via requireAdmin)
app.use('/api/admin', adminLimiter);

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  gemini: !!process.env.GEMINI_API_KEY,
  env: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

// ── 404 & Error Handlers ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Socket Events ──────────────────────────────────────────────────────────────
let connectedClients = 0;
const { state } = require('./data/mockState');

io.on('connection', (socket) => {
  connectedClients++;
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[Socket] Connected: ${socket.id} (total: ${connectedClients})`);
  }
  socket.emit('state:update', state);
  socket.on('disconnect', () => { connectedClients--; });
});

// Broadcast only when clients connected
const broadcastInterval = setInterval(() => {
  if (connectedClients > 0) io.emit('state:update', state);
}, 3000);
broadcastInterval.unref?.();

module.exports = { app, server, io };
