import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, isLoading, userProfile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand animate-spin rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to onboarding if profile is missing
  // Explicit check for userProfile === false means the check is DONE and profile is MISSING
  if (userProfile === false && location.pathname !== '/onboarding' && user?.role !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  // If we require admin but user is not admin
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If userProfile exists and we're on onboarding, go to dashboard
  if (userProfile && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children || null;
};

export default ProtectedRoute;
