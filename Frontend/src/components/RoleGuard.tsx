import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirect?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  redirect = true,
}) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = isAuthenticated && role !== null && allowedRoles.includes(role);

  useEffect(() => {
    if (!isLoading && !isAuthorized && redirect) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isLoading, isAuthorized, redirect, navigate]);

  if (isLoading) {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-6 bg-[#f4f3ec] dark:bg-[#2f303a] rounded w-1/3"></div>
        <div className="h-20 bg-[#f4f3ec] dark:bg-[#2f303a] rounded w-full"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
