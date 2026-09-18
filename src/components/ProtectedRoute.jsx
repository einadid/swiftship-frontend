import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageSpinner from './FullPageSpinner';

/**
 * Route protection.
 * - unauthenticated  -> /login (remembers where you were headed)
 * - wrong role       -> own area default (/dashboard or /admin)
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
