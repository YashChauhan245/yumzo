import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            🍔 Yumzo
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              Hi, <span className="font-medium text-gray-800">{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow p-10 inline-block">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-500 mb-6">
            You are successfully logged in to Yumzo.
          </p>
          <div className="text-left bg-gray-50 rounded-xl p-5 text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
            <p><span className="font-medium">Member since:</span>{' '}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : '—'}
            </p>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            Phase 2 features (restaurants, menus, cart, orders) coming soon…
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
