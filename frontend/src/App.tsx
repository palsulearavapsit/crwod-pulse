import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// @ts-ignore
import { SocketProvider } from './context/SocketContext';
import Footer from './components/Footer';

import Landing from './pages/Landing';
import Auth from './pages/Auth';

const AttendeeDashboard = lazy(() => import('./pages/AttendeeDashboard'));
const AdminConsole = lazy(() => import('./pages/AdminConsole'));
const DisplayMode = lazy(() => import('./pages/DisplayMode'));
const Concessions = lazy(() => import('./pages/Concessions'));
const Upgrade = lazy(() => import('./pages/Upgrade'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/display" element={<DisplayMode />} />
                <Route path="/attendee" element={
                  <ProtectedRoute requiredRole="attendee">
                    <AttendeeDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminConsole />
                  </ProtectedRoute>
                } />
                <Route path="/concessions" element={<Concessions />} />
                <Route path="/upgrade" element={<Upgrade />} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </SocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
