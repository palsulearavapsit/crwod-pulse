import { Navigate } from 'react-router-dom';
import { ROLES } from '../utils/constants';

/**
 * ProtectedRoute — enforces authentication and role-based access.
 *
 * Checks:
 *  1. User must be logged in (userRole in localStorage)
 *  2. Session must not have expired (cp_sessionExpiry)
 *  3. If requiredRole is set, user must have that role
 *
 * @param {string|undefined} requiredRole  - 'admin' | 'attendee' | undefined (any logged-in user)
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const role   = localStorage.getItem('userRole');
  const expiry = localStorage.getItem('cp_sessionExpiry');

  // 1. Not logged in
  if (!role) return <Navigate to="/login" replace />;

  // 2. Session expired — clear and redirect
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem('userRole');
    localStorage.removeItem('cp_loggedInUser');
    localStorage.removeItem('cp_sessionExpiry');
    return <Navigate to="/login" replace />;
  }

  // 3. Wrong role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === ROLES.ADMIN ? '/admin' : '/attendee'} replace />;
  }

  return children;
}
