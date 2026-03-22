import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, hasBackofficeAccess } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasBackofficeAccess) {
    return <Navigate to="/member" replace />;
  }

  return <>{children}</>;
}
