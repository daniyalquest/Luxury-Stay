import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(atob(token.split('.')[1]));
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      const redirectPath = user.role === 'guest' ? '/guest/dashboard' : '/login';
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
