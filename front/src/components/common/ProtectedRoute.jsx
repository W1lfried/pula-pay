import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Rediriger vers la page de login si non authentifié
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;