import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import DashboardPreview from './pages/DashboardPreview';
import FoodReels from './pages/FoodReels';
import DriverLogin from './pages/driver/DriverLogin';
import DriverDashboard from './pages/driver/DriverDashboard';
import AvailableOrders from './pages/driver/AvailableOrders';
import AssignedOrders from './pages/driver/AssignedOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';

const DASHBOARD_ALLOWED_EMAILS = ['yashchau.work@gmail.com'];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'yumzo-toast',
            style: {
              borderRadius: '14px',
              fontSize: '14px',
              padding: '12px 14px',
            },
            success: {
              style: { borderLeft: '4px solid #16a34a' },
            },
            error: {
              style: { borderLeft: '4px solid #ef4444' },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard-preview" element={<DashboardPreview />} />

          {/* Customer-only routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Restaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <FoodReels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']} allowedEmails={DASHBOARD_ALLOWED_EMAILS}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Driver-only routes */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/orders/available"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <AvailableOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/orders/assigned"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <AssignedOrders />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={DASHBOARD_ALLOWED_EMAILS}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={DASHBOARD_ALLOWED_EMAILS}>
                <AdminRestaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={DASHBOARD_ALLOWED_EMAILS}>
                <AdminMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={DASHBOARD_ALLOWED_EMAILS}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
