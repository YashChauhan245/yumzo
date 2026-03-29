import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const canonicalizeEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain) return normalized;

  if (domain === 'gmail.com') {
    const baseLocal = localPart.split('+')[0].replace(/\./g, '');
    return `${baseLocal}@${domain}`;
  }

  return normalized;
};

const ProtectedRoute = ({ children, allowedRoles = [], allowedEmails = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'driver' ? '/driver/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/home';
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedEmails.length > 0) {
    const normalizedAllowedEmails = allowedEmails.map((email) => canonicalizeEmail(email));
    const currentUserEmail = canonicalizeEmail(user?.email || '');
    if (!normalizedAllowedEmails.includes(currentUserEmail)) {
      const redirectPath = user.role === 'customer' ? '/home' : '/login';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
