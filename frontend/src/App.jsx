import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider } from './context/SocketContext';
import Footer from './components/Footer';

// Eager-load lightweight pages
import Landing from './pages/Landing';
import Auth    from './pages/Auth';

// Lazy-load heavy pages to reduce initial bundle size
const AttendeeDashboard = lazy(() => import('./pages/AttendeeDashboard'));
const AdminConsole      = lazy(() => import('./pages/AdminConsole'));
const DisplayMode       = lazy(() => import('./pages/DisplayMode'));
const Concessions       = lazy(() => import('./pages/Concessions'));
const Upgrade           = lazy(() => import('./pages/Upgrade'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" aria-hidden="true" />
        <p className="text-slate-400 text-sm font-semibold">Loading…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"        element={<Landing />} />
                <Route path="/login"   element={<Auth />} />
                <Route path="/display" element={<DisplayMode />} />

                <Route path="/attendee" element={
                  <ProtectedRoute requiredRole="attendee">
                    <ErrorBoundary><AttendeeDashboard /></ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/concessions" element={
                  <ProtectedRoute>
                    <ErrorBoundary><Concessions /></ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/upgrade" element={
                  <ProtectedRoute>
                    <ErrorBoundary><Upgrade /></ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <ErrorBoundary><AdminConsole /></ErrorBoundary>
                  </ProtectedRoute>
                } />
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
