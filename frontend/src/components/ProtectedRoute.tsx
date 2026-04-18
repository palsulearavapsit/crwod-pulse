import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'attendee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem('userRole');
  const sessionExpiry = localStorage.getItem('cp_sessionExpiry');

  // Check session validity
  const isExpired = sessionExpiry ? Date.now() > parseInt(sessionExpiry) : true;

  if (!userRole || isExpired) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/attendee'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
