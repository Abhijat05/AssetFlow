import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { DepartmentTab } from "../components/DepartmentTab";
import { CategoryTab } from "../components/CategoryTab";
import { EmployeeDirectoryTab } from "../components/EmployeeDirectoryTab";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { Building2, Tag, Users } from "lucide-react";

export const OrganizationSetup: React.FC = () => {
  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Page Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <h1 className="text-xl font-bold text-ink tracking-tight">Organization Setup</h1>
            <p className="text-sm text-slate-500">Manage departments, asset categories, and employees.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <TabsPrimitive.Root defaultValue="departments">
            <TabsPrimitive.List className="flex gap-1 p-1 rounded-full bg-slate-100 w-fit mb-8">
              {[
                { value: "departments", label: "Departments", icon: <Building2 className="h-3.5 w-3.5" /> },
                { value: "categories", label: "Asset Categories", icon: <Tag className="h-3.5 w-3.5" /> },
                { value: "employees", label: "Employees", icon: <Users className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <TabsPrimitive.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
                >
                  {tab.icon}
                  {tab.label}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>

            <TabsPrimitive.Content value="departments"><DepartmentTab /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="categories"><CategoryTab /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="employees"><EmployeeDirectoryTab /></TabsPrimitive.Content>
          </TabsPrimitive.Root>
        </div>
      </div>
    </AppShell>
  );
};
