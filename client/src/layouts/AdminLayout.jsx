import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Get user info from JWT token
  const user = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold">LuxuryStay Admin</h1>
        <div className="mb-4">
          {user && (
            <div>
              <span className="font-semibold">{user.name} ({user.role})</span>
              <div>{user.email}</div>
            </div>
          )}
        </div>
        <nav className="flex flex-col space-y-2">
          <Link to="/admin/dashboard" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Dashboard</Link>
          <Link to="/admin/users" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Users</Link>
          <Link to="/admin/rooms" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Rooms</Link>
          <Link to="/admin/bookings" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Bookings</Link>
          <Link to="/admin/feedback" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Feedback</Link>
          <Link to="/admin/notifications" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Notifications</Link>
          <Link to="/admin/settings" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">Settings</Link>
        </nav>
        <button onClick={handleLogout} className="mt-4 bg-red-500 px-4 py-2 rounded">Logout</button>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
