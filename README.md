# CrowdPulse — Real-Time Venue Intelligence Platform

![CI](https://github.com/palsulearavapsit/crowdpulse/actions/workflows/ci.yml/badge.svg)

> AI-powered crowd management. Live gate routing, real-time alerts, and admin control — built for large-scale live events.

---

## 🏗 Architecture Overview

```
crowdpulse/
├── frontend/        Vite + React 19 (TypeScript-ready)
│   ├── src/
│   │   ├── context/        SocketContext (shared WebSocket)
│   │   ├── components/     ErrorBoundary, ProtectedRoute, Toast, Footer
│   │   ├── pages/          Auth, AttendeeDashboard, AdminConsole, Upgrade, …
│   │   ├── utils/          constants.js, fetchUtils.js, hashUtils.js
│   │   └── __tests__/      Vitest test suites
│   └── vitest.config.js
│
└── backend/         Node.js + Express 5 + Socket.io
    ├── app.js           Express factory (importable by tests)
    ├── server.js        Minimal entry point
    ├── routes/
    │   ├── api.js       REST API + admin endpoints (rate-limited, auth-guarded)
    │   └── ai.js        Gemini 1.5 Flash AI endpoints (11 routes)
    ├── data/
    │   └── mockState.js Venue state + live simulation engine
    └── tests/           Jest + Supertest integration tests
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### 1. Backend
```bash
cd backend
cp .env.example .env       # Add your API keys
npm install
npm run dev                # Starts on http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 3000) | No |
| `FRONTEND_URL` | Allowed CORS origin | Yes (prod) |
| `ADMIN_SECRET` | Bearer token for admin API routes | Yes |
| `GEMINI_API_KEY` | Google AI Studio key for Gemini 1.5 Flash | Recommended |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Backend Socket.io URL |
| `VITE_ADMIN_SECRET` | Must match backend `ADMIN_SECRET` |

---

## 🔐 Authentication

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin — full console access |
| `arav` | `arav` | Attendee |
| `harsh` | `harsh` | Attendee |

New accounts can be created via **Sign Up**. Passwords are hashed with **SHA-256 + salt** (Web Crypto API) before being stored in `localStorage`.

---

## 🌐 Google Services

| Service | Usage |
|---|---|
| **Gemini 1.5 Flash** | 11 AI endpoints: chat, translation, triage, anomaly detection, journey planning, ops summary, emergency guidance |
| **Google Maps Embed** | Live venue location on attendee dashboard |
| **Google Fonts** | Inter typeface |
| **Google Analytics** | Event tracking (login, chat, emergency, navigation) |

---

## 🧪 Testing

```bash
# Frontend (Vitest)
cd frontend
npm test              # Run all tests
npm run test:coverage # Coverage report

# Backend (Jest + Supertest)
cd backend
npm test              # 50+ integration & unit tests
```

**Test Coverage:**
- `auth.test.js` — 21 tests: login validation, signup flow, role assignment
- `hashUtils.test.js` — 10 tests: SHA-256 hashing, tamper detection
- `constants.test.js` — 19 tests: shared constants sanity checks
- `api.test.js` — 27 backend integration tests
- `mockState.test.js` — 14 unit tests: simulation engine
- `ai.test.js` — 14 AI route integration tests

---

## 🛡 Security

- ✅ Bearer token authentication on all admin endpoints
- ✅ Rate limiting: 3 tiers (general / AI / admin)
- ✅ Content Security Policy header
- ✅ Security headers: X-Frame-Options, XSS-Protection, Referrer-Policy, Permissions-Policy
- ✅ HTTPS redirect in production
- ✅ SHA-256 password hashing (Web Crypto API)
- ✅ 24-hour session expiry
- ✅ Input validation + sanitization on all routes
- ✅ Request body size cap (10kb)

---

## ⚡ Performance

- React.lazy + Suspense for heavy pages (AdminConsole, Dashboard)
- Shared socket context (single WebSocket for entire app)
- Broadcast suppressed when 0 clients connected
- AbortController timeout (10s) on all fetch calls
- `useMemo` for chart data rendering
- Google Fonts with `preconnect`

---

## 🎯 Key Features

### Attendee Dashboard
- 🗺 **AI Smart Route** with AR wayfinding toggle
- 📊 **Live Wait Time Bar Chart** (Recharts, colour-coded)
- 🌍 **Multilingual Alerts** (EN → ES/FR/HI via Gemini)
- 🚨 **Emergency Evacuation Guide** with AI instructions
- 📍 **Google Maps** venue location embed
- 🤖 **AI Chat Assistant** with focus trap & auto-scroll
- ♿ **Accessible Routing** toggle + ARIA-complete UI

### Admin Console
- ⚡ **Live Scenario Triggers** (Halftime, Gate Closure, Egress, Reset)
- 🔧 **Zone Manager** with wait-time editing and open/close toggle
- 📡 **Push Alerts** with AI enhancement
- 🧠 **AI Ops Summary** + Gemini Anomaly Scan
- 🏷 **AI Flash Sale** generator
- 👥 **Audience Tier Dashboard** (General / VIP / Platinum)
- 📊 **Live KPI Widgets**

---

## 🚢 Deployment

- **Frontend** → Vercel (`npm run build` → `/frontend/dist`)
- **Backend** → Render (`node server.js`)

See `.github/workflows/ci.yml` for the full CI pipeline.

---

*Built for Hackathon — Powered by Gemini AI + Google Maps + Socket.io*
