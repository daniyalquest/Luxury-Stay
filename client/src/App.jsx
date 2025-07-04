import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Rooms from './pages/admin/Rooms';
import Bookings from './pages/admin/Bookings';
import Feedback from './pages/admin/Feedback';
import Notifications from './pages/admin/Notifications';
import SystemSettings from './pages/admin/SystemSettings';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GuestLayout from './layouts/GuestLayout';
import GuestDashboard from './pages/guest/Dashboard';
import GuestBookings from './pages/guest/Bookings';
import GuestProfile from './pages/guest/Profile';
import GuestFeedback from './pages/guest/Feedback';

function App() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_skipActionErrorRevalidation: true
          }}
        >
          <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes for staff only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'housekeeping']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Guest routes */}
          <Route
            path="/guest"
            element={
              <ProtectedRoute allowedRoles={['guest']}>
                <GuestLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<GuestDashboard />} />
            <Route path="bookings" element={<GuestBookings />} />
            <Route path="feedback" element={<GuestFeedback />} />
            <Route path="profile" element={<GuestProfile />} />
          </Route>

          {/* Default redirect based on user role */}
          <Route
            path="*"
            element={
              <Navigate 
                to={
                  user 
                    ? (user.role === 'guest' ? "/guest/dashboard" : "/admin/dashboard")
                    : "/login"
                } 
                replace 
              />
            }
          />
        </Routes>
      </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
