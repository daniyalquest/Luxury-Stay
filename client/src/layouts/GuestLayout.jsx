import { Link, Outlet } from "react-router-dom";
import { useMemo } from "react";

const GuestLayout = () => {
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
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-blue-800 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold">LuxuryStay Guest</h1>
        <div className="mb-4">
          {user && (
            <div>
              <span className="font-semibold">Welcome, {user.name}</span>
              <div>{user.email}</div>
            </div>
          )}
        </div>
        <nav className="flex flex-col space-y-2">
          <Link to="/guest/dashboard" className="text-gray-300 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md">Dashboard</Link>
          <Link to="/guest/bookings" className="text-gray-300 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md">My Bookings</Link>
          <Link to="/guest/feedback" className="text-gray-300 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md">Feedback</Link>
          <Link to="/guest/profile" className="text-gray-300 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md">Profile</Link>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default GuestLayout;