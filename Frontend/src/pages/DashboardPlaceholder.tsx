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
        return "bg-purple-950/10 text-purple-600 border-purple-900/20 rounded-full";
      case "ASSET_MANAGER":
        return "bg-blue-950/10 text-blue-600 border-blue-900/20 rounded-full";
      case "DEPARTMENT_HEAD":
        return "bg-amber-950/10 text-amber-600 border-amber-900/20 rounded-full";
      default:
        return "bg-surface-2 text-ink-muted border-hairline rounded-full";
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-ink">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-primary shadow-sm font-black">
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
            <span className="font-bold -tracking-body text-ink">
              AssetFlow <span className="text-xs font-normal text-ink-subtle">ERP</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-ink">{user?.name}</span>
              <span className="text-[10px] text-ink-subtle capitalize">{role?.toLowerCase().replace("_", " ")}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center border border-hairline">
              <UserIcon className="h-4 w-4 text-ink-subtle" />
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
          <h1 className="text-3xl font-semibold -tracking-heading-2 text-ink animate-reveal">
            Dashboard
          </h1>
          <p className="text-ink-subtle text-sm">
            Welcome back, <span className="font-semibold text-ink">{user?.name}</span>. This is your authentication and authorization center.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details */}
          <Card className="border border-hairline shadow-2xl col-span-1 lg:col-span-2 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ink">Authentication Details</CardTitle>
              <CardDescription className="text-ink-subtle">Verify your user properties loaded from Better Auth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.4px]">User ID</span>
                  <p className="text-sm font-mono bg-surface-2 p-2 rounded-md border border-hairline text-ink-muted break-all">
                    {user?.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.4px]">Email Address</span>
                  <p className="text-sm font-medium text-ink bg-surface-2 p-2 rounded-md border border-hairline">
                    {user?.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.4px]">Role Assigned</span>
                  <div className="pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${getRoleBadgeColor(role)}`}>
                      <Shield className="h-3 w-3" />
                      {role}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.4px]">Account Status</span>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border border-success-green/20 bg-success-green/10 text-success-green">
                      <UserCheck className="h-3 w-3" />
                      {user?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline space-y-2">
                <span className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.4px]">Session Key (expiresAt)</span>
                <p className="text-sm text-ink-muted">
                  {session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-hairline shadow-2xl col-span-1 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ink">Authentication Demo</CardTitle>
              <CardDescription className="text-ink-subtle">Try out routing & notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => toast.success("This toast triggers using Sonner!")}
              >
                <ChevronRight className="h-4 w-4 mr-2 text-brand-blue" />
                Test toast notification
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start text-[#d9383a] hover:text-[#d9383a]/80 hover:bg-[#ffeef0]/50"
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
                <ChevronRight className="h-4 w-4 mr-2 text-brand-blue" />
                Manually trigger 404 Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Authorization Demo (RoleGuard checks) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Role-Based Access Control Showcase
          </h2>
          <p className="text-sm text-ink-subtle max-w-2xl">
            The sections below demonstrate the usage of the <code className="text-xs px-1.5 py-0.5 bg-surface-2 rounded-md border border-hairline">&lt;RoleGuard&gt;</code> component.
            Sections will render their contents if you match the role, otherwise they will display the custom fallback.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* EMPLOYEE Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]}
              redirect={false}
              fallback={
                <Card className="border-[#d9383a]/30 bg-[#ffeef0]/50 opacity-70 rounded-xl">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-[#d9383a]">
                      <Lock className="h-4 w-4" /> Employee Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-[#d9383a]/80">
                    Access Denied. Employee role required.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-[#00a3a3]/30 bg-[#e6f7f7]/60 rounded-xl transition-all duration-200 hover:-rotate-1 hover:scale-105 hover:shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-[#004d4d] font-semibold">
                    <UserIcon className="h-4 w-4" /> Employee Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-[#004d4d]/90 font-medium">
                  Unlocked! Available to all registered employees.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* DEPARTMENT HEAD Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "DEPARTMENT_HEAD"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75 rounded-xl">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-ink-subtle">
                      <Lock className="h-4 w-4" /> Dept Head Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-ink-subtle">
                    Restricted. Requires DEPARTMENT_HEAD or ADMIN.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-[#ff7c65]/30 bg-[#fff0ed] rounded-xl transition-all duration-200 hover:rotate-1 hover:scale-105 hover:shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-[#802313] font-semibold">
                    <Building className="h-4 w-4" /> Dept Head Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-[#802313]/90 font-medium">
                  Unlocked! Visible to Department Heads and Admins.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* ASSET_MANAGER Guard */}
            <RoleGuard
              allowedRoles={["ADMIN", "ASSET_MANAGER"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75 rounded-xl">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-ink-subtle">
                      <Lock className="h-4 w-4" /> Asset Manager Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-ink-subtle">
                    Restricted. Requires ASSET_MANAGER or ADMIN.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-[#4262ff]/30 bg-[#f5f6fc] rounded-xl transition-all duration-200 hover:-rotate-1 hover:scale-105 hover:shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-[#050038] font-semibold">
                    <Briefcase className="h-4 w-4" /> Asset Manager Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-[#050038]/90 font-medium">
                  Unlocked! Visible to Asset Managers and Admins.
                </CardContent>
              </Card>
            </RoleGuard>

            {/* ADMIN Guard */}
            <RoleGuard
              allowedRoles={["ADMIN"]}
              redirect={false}
              fallback={
                <Card className="border-hairline bg-surface-2/30 opacity-75 rounded-xl">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-ink-subtle">
                      <Lock className="h-4 w-4" /> Admin Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-ink-subtle">
                    Restricted. Requires ADMIN role.
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-[#ffd02f]/40 bg-[#ffd02f]/10 rounded-xl transition-all duration-200 hover:rotate-1 hover:scale-105 hover:shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5 text-primary font-semibold">
                    <Shield className="h-4 w-4" /> Admin Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-primary/95 flex flex-col gap-2 font-medium">
                  <p>Unlocked! Only accessible to System Administrators.</p>
                  <Button
                    onClick={() => navigate("/organization")}
                    className="w-full text-xs bg-primary hover:bg-primary-hover text-white cursor-pointer mt-1 font-semibold transition-colors rounded-full"
                  >
                    Go to Organization Setup
                  </Button>
                </CardContent>
              </Card>
            </RoleGuard>
          </div>
        </div>
      </main>
    </div>
  );
};
