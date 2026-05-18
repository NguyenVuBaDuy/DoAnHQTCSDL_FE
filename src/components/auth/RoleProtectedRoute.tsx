import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import NotFoundPage from '../../pages/NotFoundPage';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user } = useAppSelector((state) => state.auth);

  const token = localStorage.getItem('accessToken');

  // If we have a token but user data hasn't loaded yet, show loading instead of redirecting
  if (!user && token) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.tennhom;

  if (role && !allowedRoles.includes(role)) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};
