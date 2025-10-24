import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  children: React.ReactElement;
  roles?: string | string[]; // roles allowed to access
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, hasRole } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles) {
    if (!hasRole(roles)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}