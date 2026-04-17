const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS setup: allow localhost and specific Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
const state = require('./data/mockState');
const apiRoutes = require('./routes/api')(io);
const aiRoutes = require('./routes/ai');

app.use('/api', apiRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);
  
  // Send initial state
  socket.emit('state:update', state);

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
  });
});

// Periodic State Update Broadcaster
setInterval(() => {
  io.emit('state:update', state);
}, 3000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
