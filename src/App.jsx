import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import FullPageSpinner from './components/FullPageSpinner';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrackPage from './pages/TrackPage';
import NotFound from './pages/NotFound';

import UserDashboard from './pages/user/Dashboard';
import MyParcels from './pages/user/MyParcels';
import BookParcel from './pages/user/BookParcel';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminParcels from './pages/admin/AdminParcels';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from './pages/admin/AdminUsers';

/**
 * Authenticated shell for the normal-user area.
 * Admins visiting user URLs get redirected to /admin (role-based UI access).
 */
function UserAreaShell() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function AdminAreaShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '0.75rem', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/track" element={<TrackPage />} />
        </Route>

        {/* Normal-user area */}
        <Route element={<ProtectedRoute roles={['user']} />}>
          <Route element={<UserAreaShell />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/parcels" element={<MyParcels />} />
            <Route path="/parcels/book" element={<BookParcel />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminAreaShell />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/parcels" element={<AdminParcels />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <FullPageSpinner />
    </AuthProvider>
  );
}
