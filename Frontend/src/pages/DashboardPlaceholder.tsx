import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Shield,
  Briefcase,
  Lock,
  Building,
  LogOut,
  ChevronRight,
  UserCheck
} from "lucide-react";

export const DashboardPlaceholder: React.FC = () => {
  const { user, session, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Successfully logged out!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleBadgeColor = (userRole: string | null) => {
    switch (userRole) {
      case "ADMIN":
        return "bg-purple-950/40 text-purple-300 border-purple-900/30";
      case "ASSET_MANAGER":
        return "bg-blue-950/40 text-blue-300 border-blue-900/30";
      case "DEPARTMENT_HEAD":
        return "bg-amber-950/40 text-amber-300 border-amber-900/30";
      default:
        return "bg-surface-2 text-slate-300 border-hairline";
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-foreground">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-foreground">
              AssetFlow <span className="text-xs font-normal text-slate-500">ERP</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">{user?.name}</span>
              <span className="text-[10px] text-slate-500 capitalize">{role?.toLowerCase().replace("_", " ")}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center border border-hairline">
              <UserIcon className="h-4 w-4 text-slate-400" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-3 w-3 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. This is your authentication and authorization center.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details */}
          <Card className="border border-hairline shadow-2xl col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Authentication Details</CardTitle>
              <CardDescription className="text-slate-500">Verify your user properties loaded from Better Auth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</span>
                  <p className="text-sm font-mono bg-surface-2 p-2 rounded border border-hairline text-slate-300 break-all">
                    {user?.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <p className="text-sm font-medium text-foreground bg-surface-2 p-2 rounded border border-hairline">
                    {user?.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Assigned</span>
                  <div className="pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(role)}`}>
                      <Shield className="h-3 w-3" />
                      {role}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</span>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-green-900/30 bg-green-950/20 text-green-400">
                      <UserCheck className="h-3 w-3" />
                      {user?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Key (expiresAt)</span>
                <p className="text-sm text-slate-300">
                  {session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats / Actions */}
          <Card className="border border-hairline shadow-2xl col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Authentication Demo</CardTitle>
              <CardDescription className="text-slate-500">Try out routing & notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => toast.success("This toast triggers using Sonner!")}
              >
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                Test toast notification
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start text-red-400 hover:text-red-300 hover:bg-red-950/10"
                onClick={() => navigate("/unauthorized")}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Manually trigger 403 Page
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => navigate("/some-nonexistent-page")}
              >
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                Manually trigger 404 Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Authorization Demo (RoleGuard checks) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Role-Based Access Control Showcase
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            The sections below demonstrate the usage of the <code className="text-xs px-1.5 py-0.5 bg-surface-2 rounded border border-hairline">&lt;RoleGuard&gt;</code> component.
            Sections will render their contents if you match the role, otherwise they will display the custom fallback.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* EMPLOYEE Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]}
              redirect={false}
              fallback={
                <Card className="border-red-900/30 bg-red-950/10 opacity-70">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-red-400">
                      <Lock className="h-4 w-4" /> Employee Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-red-400/80">
                    Access Denied. Employee role required.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-green-900/30 bg-green-950/10">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-green-400">
                    <UserIcon className="h-4 w-4" /> Employee Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-green-500">
                  Unlocked! Available to all registered employees.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* DEPARTMENT HEAD Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "DEPARTMENT_HEAD"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-slate-500">
                      <Lock className="h-4 w-4" /> Dept Head Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-slate-500">
                    Restricted. Requires DEPARTMENT_HEAD or ADMIN.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-amber-900/30 bg-amber-950/10">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-amber-400">
                    <Building className="h-4 w-4" /> Dept Head Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-amber-500">
                  Unlocked! Visible to Department Heads and Admins.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* ASSET_MANAGER Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "ASSET_MANAGER"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-slate-500">
                      <Lock className="h-4 w-4" /> Asset Manager Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-slate-500">
                    Restricted. Requires ASSET_MANAGER or ADMIN.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-blue-900/30 bg-blue-950/10">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-blue-400">
                    <Briefcase className="h-4 w-4" /> Asset Manager Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-blue-500">
                  Unlocked! Visible to Asset Managers and Admins.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* ADMIN Guard */}
            <RoleGuard
              allowedRoles={["ADMIN"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-slate-500">
                      <Lock className="h-4 w-4" /> Admin Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-slate-500">
                    Restricted. Requires ADMIN role.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-purple-900/30 bg-purple-950/10">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-purple-400">
                    <Shield className="h-4 w-4" /> Admin Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-purple-500">
                  Unlocked! Only accessible to System Administrators.
                </CardContent>
              </Card>
            </RoleGuard>
          </div>
        </div>
      </main>
    </div>
  );
};
