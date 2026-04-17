# CrowdPulse 🏟️

**CrowdPulse** is a high-fidelity venue management and attendee experience platform designed to completely optimize physical event spaces (stadiums, concert halls, large conferences). Using live IoT mock data and advanced generative AI, it routes users to low-congestion gates, manages food concessions, and hands venue administrators ultimate control over their live events.

---

## 🌟 Key Features

### 👤 Attendee Experience
* **AI Smart Routing**: Get step-by-step guidance to the lowest congestion gates tailored to accessibility needs.
* **Premium Upgrades**: Purchase VIP or Platinum passes in the app to unlock exclusive physical gates and lounges.
* **Mobile Express Order**: Order concessions directly to your seat with QR payment mockups.
* **Venue AI Chat Assistant**: Converse naturally with a Gemini-powered copilot to ask for specific arena directions.
* **Live AR Compass**: Spin up a simulated AR wayfinding compass.

### 🛡️ Admin Command Center
* **Live Topology Map**: Adjust mock wait times or fully physically **CLOSE/LOCK** gates on the fly.
* **Global Push Alerts**: Trigger push notifications to all users, or use Gemini AI to draft professional disruption alerts.
* **Incident Analytics**: Run deep Gemini Sentiment Analysis on venue queues.
* **Staff Integrations**: Upload photos of 'Lost & Found' items or 'Triage Incidents' to instantly sync with the public app using Gemini Vision.
* **AI Magic CLI**: Command the stadium via natural text (e.g. *"Trigger Halftime Rush mode"*).

---

## 🛠️ Technology Stack

* **Frontend Engine**: React 18, Vite
* **Styling & UI**: Tailwind CSS v4 featuring Dark Neon Glassmorphism, modern Lucide icons.
* **Backend Runtime**: Node.js, Express
* **Real-time Engine**: Socket.IO (Bidirectional synchronous state updates)
* **AI Copilots**: Supported natively by the Gemini API
* **Runner**: Python (Automated threaded dual-server bootstrapper `run.py`)

---

## 🚀 Running the Project Locally

The quickest way to boot the environment is using the pre-configured Python runner script, which handles both the Vite client output and the Node/Express backend natively.

### Prerequisites
* [Node.js (v18+)](https://nodejs.org/) installed
* [Python (v3+)](https://python.org/) installed

### Start-Up Steps
1. Navigate to the project root directory:
   ```bash
   cd crowdpulse
   ```
2. Make sure you install dependencies in both the backend and frontend initially:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```
3. Run the automated bootstrapper:
   ```bash
   python run.py
   ```
4. Access the web interface at `http://localhost:5173`.

---

## 🔒 Authentication

The application features role-based gating.

* **Admin Access**:
  * **Username**: `admin`
  * **Password**: `admin123`
* **Attendee Access**:
  * Register using any other mock credentials.

*(Note: Signing out properly destroys persistent local storage elements to reset simulation state for testing purposes).*
