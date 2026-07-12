import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Landing } from "../pages/Landing";
import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";
import { Unauthorized } from "../pages/Unauthorized";
import { NotFound } from "../pages/NotFound";
import { DashboardPlaceholder } from "../pages/DashboardPlaceholder";
import { OrganizationSetup } from "../modules/organization/pages/OrganizationSetup";
import { AssetDirectory } from "../modules/assets/pages/AssetDirectory";
import { AssetDetail } from "../modules/assets/pages/AssetDetail";
import { RoleGuard } from "../components/RoleGuard";

// PublicRoute redirects logged-in users away from auth pages (e.g. back to dashboard)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fcfbfc] dark:bg-[#121113]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#121113] dark:border-[#fcfbfc] border-t-transparent dark:border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN"]}>
              <OrganizationSetup />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}>
              <AssetDirectory />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}>
              <AssetDetail />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Auth Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Fallback 404 Route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
