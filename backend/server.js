/**
 * server.js — Entry point. Imports the app and starts listening.
 * Kept minimal so app.js can be tested independently.
 */
require('dotenv').config();
const { server } = require('./app');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[CrowdPulse] Backend running on port ${PORT}`);
  console.log(`[Gemini] ${process.env.GEMINI_API_KEY ? '✓ API key loaded' : '✗ No key — using mock fallbacks'}`);
  console.log(`[Security] Rate limiting active`);
});
