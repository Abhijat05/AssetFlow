import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCircle2,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Nav item definition ───────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4 flex-shrink-0" />,
    to: "/dashboard",
    roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"],
  },
  {
    label: "Asset Registry",
    icon: <Database className="h-4 w-4 flex-shrink-0" />,
    to: "/assets",
    roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  },
  {
    label: "Organization",
    icon: <Building2 className="h-4 w-4 flex-shrink-0" />,
    to: "/organization",
    roles: ["ADMIN"],
  },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
}> = ({ mobileOpen, onMobileClose, collapsed, onCollapseToggle }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          // Base
          "fixed top-0 left-0 z-40 h-full flex flex-col bg-white border-r border-slate-200 shadow-sm",
          // Desktop collapse transition
          "lg:static lg:z-auto lg:translate-x-0",
          "transition-[width,transform] duration-200 ease-in-out",
          // Desktop width
          collapsed ? "lg:w-16" : "lg:w-60",
          // Mobile: always full width, slide in/out
          "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Collapse Toggle */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-slate-100 flex-shrink-0 overflow-hidden",
            collapsed ? "px-0 justify-center" : "px-5 justify-between"
          )}
        >
          {/* Logo mark — always visible */}
          <div
            className={cn(
              "flex items-center gap-2.5 min-w-0",
              collapsed && "lg:hidden"
            )}
          >
            <div className="h-8 w-8 rounded-xl bg-[#ffd02f] flex items-center justify-center shadow-sm flex-shrink-0">
              <Package className="h-4 w-4 text-[#050038]" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-[#050038] tracking-tight whitespace-nowrap overflow-hidden">
              AssetFlow <span className="text-[10px] font-normal text-slate-400">ERP</span>
            </span>
          </div>

          {/* Collapsed state: just icon */}
          {collapsed && (
            <div className="hidden lg:flex items-center justify-center w-full">
              <div className="h-8 w-8 rounded-xl bg-[#ffd02f] flex items-center justify-center shadow-sm">
                <Package className="h-4 w-4 text-[#050038]" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={onCollapseToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 flex-shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={() => onMobileClose()}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden",
                  // Width-aware padding
                  collapsed ? "lg:px-0 lg:justify-center px-3 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-[#4262ff]/10 text-[#4262ff] font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              {() => (
                <>
                  <span className={cn(
                    "flex items-center justify-center flex-shrink-0",
                    collapsed ? "lg:w-full" : ""
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-200",
                    collapsed ? "lg:hidden" : "block"
                  )}>
                    {item.label}
                  </span>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-100 p-2 space-y-0.5 flex-shrink-0">
          {/* User info */}
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden",
              collapsed && "lg:justify-center lg:px-0"
            )}
            title={collapsed ? `${user?.name}` : undefined}
          >
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <UserCircle2 className="h-5 w-5 text-slate-500" />
            </div>
            <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">
                {role?.toLowerCase().replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={collapsed ? "Log Out" : undefined}
            className={cn(
              "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors overflow-hidden",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>
              {isLoggingOut ? "Logging out…" : "Log Out"}
            </span>

            {/* Tooltip */}
            {collapsed && (
              <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                Log Out
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── App Shell ─────────────────────────────────────────────────────────────────
export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#ffd02f] flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-[#050038]" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-[#050038]">AssetFlow</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Dashboard Home ────────────────────────────────────────────────────────────
const QuickAccessCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
  color: string;
}> = ({ icon, label, description, to, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left w-full rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", color)}>
        {icon}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-ink">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#4262ff] group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
      </div>
    </button>
  );
};

export const DashboardPlaceholder: React.FC = () => {
  const { user, role } = useAuth();

  const cards = [
    role && ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(role) && {
      icon: <Database className="h-5 w-5 text-[#4262ff]" />,
      label: "Asset Registry",
      description: "Register, track and manage all organizational assets with full history.",
      to: "/assets",
      color: "bg-[#4262ff]/10",
    },
    role === "ADMIN" && {
      icon: <Building2 className="h-5 w-5 text-emerald-600" />,
      label: "Organization Setup",
      description: "Manage departments, asset categories, and employee directory.",
      to: "/organization",
      color: "bg-emerald-50",
    },
  ].filter(Boolean) as any[];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">
            You're signed in as{" "}
            <span className="font-semibold text-[#4262ff] capitalize">
              {role?.toLowerCase().replace(/_/g, " ")}
            </span>
            . Here's a quick overview of your access.
          </p>
        </div>

        {/* Quick Access */}
        {cards.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Access</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card: any) => (
                <QuickAccessCard key={card.to} {...card} />
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Full Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Role", value: role?.replace(/_/g, " ") },
              { label: "Status", value: user?.status },
              {
                label: "Member Since",
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="font-semibold text-ink capitalize">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Employee message */}
        {role === "EMPLOYEE" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold mb-1">Limited Access Role</p>
            <p className="text-amber-700 leading-relaxed">
              Your current role as <strong>Employee</strong> provides read-only access. Contact your admin to request elevated permissions for asset management.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
};
