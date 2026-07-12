import React, { useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useAuth } from "../../../context/AuthContext";
import { DepartmentTab } from "../components/DepartmentTab";
import { CategoryTab } from "../components/CategoryTab";
import { EmployeeDirectoryTab } from "../components/EmployeeDirectoryTab";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  LogOut,
  Building2,
  Tag,
  Users,
  LayoutDashboard,
  Shield,
} from "lucide-react";

export const OrganizationSetup: React.FC = () => {
  const { user, role, logout } = useAuth();
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

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-ink">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
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

          {/* User Details & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-ink">{user?.name}</span>
              <span className="text-[10px] text-ink-subtle capitalize">
                {role?.toLowerCase().replace("_", " ")}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center border border-hairline">
              <UserIcon className="h-4 w-4 text-ink-subtle" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-hairline hover:bg-surface-2 text-ink-muted"
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
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb / Nav Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-ink-subtle font-medium uppercase tracking-[0.4px]">
              <Shield className="h-3.5 w-3.5 text-brand-blue" />
              Admin Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold -tracking-display-md text-ink">
              Organization Setup
            </h1>
            <p className="text-ink-subtle text-sm -tracking-body">
              Configure departments, categories, and manage employee directories.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-hairline hover:bg-surface-2 text-ink-muted w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Tab System */}
        <TabsPrimitive.Root defaultValue="departments" className="w-full space-y-6">
          {/* Tabs Triggers List */}
          <TabsPrimitive.List className="inline-flex h-11 items-center justify-start rounded-full bg-surface-2 p-1 text-ink-subtle border border-hairline gap-1">
            <TabsPrimitive.Trigger
              value="departments"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold ring-offset-canvas transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer select-none"
            >
              <Building2 className="h-4 w-4" />
              Departments
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="categories"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold ring-offset-canvas transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer select-none"
            >
              <Tag className="h-4 w-4" />
              Asset Categories
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="employees"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold ring-offset-canvas transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer select-none"
            >
              <Users className="h-4 w-4" />
              Employee Directory
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>

          {/* Tab Content 1: Department Management */}
          <TabsPrimitive.Content
            value="departments"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] focus-visible:ring-offset-2 rounded-lg"
          >
            <DepartmentTab />
          </TabsPrimitive.Content>

          {/* Tab Content 2: Asset Categories */}
          <TabsPrimitive.Content
            value="categories"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] focus-visible:ring-offset-2 rounded-lg"
          >
            <CategoryTab />
          </TabsPrimitive.Content>

          {/* Tab Content 3: Employee Directory */}
          <TabsPrimitive.Content
            value="employees"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] focus-visible:ring-offset-2 rounded-lg"
          >
            <EmployeeDirectoryTab />
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </main>
    </div>
  );
};
