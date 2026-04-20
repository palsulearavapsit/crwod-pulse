import React from 'react'
console.log('🚀 CrowdPulse Initializing...');

import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n/config' // Import i18n config

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
