import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

/**
 * App - Main application with routes
 * Uses React Router v6 with lazy loaded routes
 */
export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireProfile>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/perfil"
        element={
          <ProtectedRoute requireProfile={false}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Root redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute requireProfile>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}