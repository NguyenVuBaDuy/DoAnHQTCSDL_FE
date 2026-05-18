import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import NotFoundPage from '../../pages/NotFoundPage';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.tennhom;

  if (role && !allowedRoles.includes(role)) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};
