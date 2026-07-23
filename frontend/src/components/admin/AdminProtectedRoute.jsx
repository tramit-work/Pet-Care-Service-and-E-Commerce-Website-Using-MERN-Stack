import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

function AdminProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, loading, user } = useAdminAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireRole) {
    const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return children;
}

export default AdminProtectedRoute;
