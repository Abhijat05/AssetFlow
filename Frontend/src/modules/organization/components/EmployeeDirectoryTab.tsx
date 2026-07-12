import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../../context/AuthContext";
import {
  useEmployees,
  useDepartments,
  useUpdateEmployeeRole,
  useUpdateEmployeeDepartment,
  useUpdateEmployeeStatus,
} from "../hooks/useOrganization";
import type { Employee, EmployeeQuery } from "../types";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ConfirmationDialog } from "../../../components/ui/confirmation-dialog";
import {
  Search,
  Edit2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Users,
  Shield,
  Building,
  Mail,
  FilterX,
} from "lucide-react";
import type { UserRole } from "../../../types/auth";

// Form Schema
const employeeEditSchema = z.object({
  departmentId: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type EmployeeEditValues = z.infer<typeof employeeEditSchema>;

export const EmployeeDirectoryTab: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Queries
  const { data: departments = [], isLoading: isLoadingDepts } = useDepartments();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "status" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Construct query object for server-side search
  const employeeQuery = useMemo(() => {
    const query: Omit<EmployeeQuery, "departmentId"> & { departmentId?: string | null } = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };

    if (searchTerm) {
      if (searchTerm.includes("@")) {
        query.email = searchTerm;
      } else {
        query.name = searchTerm;
      }
    }
    if (deptFilter !== "all") {
      query.departmentId = deptFilter === "none" ? null : deptFilter;
    }
    if (roleFilter !== "all") {
      query.role = roleFilter as import("../../../types/auth").UserRole;
    }
    if (statusFilter !== "all") {
      query.status = statusFilter as "ACTIVE" | "INACTIVE";
    }

    return query as EmployeeQuery;
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm, deptFilter, roleFilter, statusFilter]);

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees(employeeQuery);
  const employees = employeesData?.data || [];
  const meta = employeesData?.meta;
  const totalPages = meta?.totalPages || 1;

  // Mutations
  const updateRoleMutation = useUpdateEmployeeRole();
  const updateDeptMutation = useUpdateEmployeeDepartment();
  const updateStatusMutation = useUpdateEmployeeStatus();

  // Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isConfirmRoleOpen, setIsConfirmRoleOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EmployeeEditValues | null>(null);

  // Form setup
  const {
    handleSubmit,
    control,
    reset,
    watch,
  } = useForm<EmployeeEditValues>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      departmentId: "none",
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedRole = watch("role");

  // Open Edit dialog
  const handleEditOpen = (emp: Employee) => {
    setEditingEmployee(emp);
    reset({
      departmentId: emp.departmentId || "none",
      role: emp.role,
      status: emp.status,
    });
    setIsEditOpen(true);
  };

  // Submit edit dialog
  const handleFormSubmit = (values: EmployeeEditValues) => {
    if (!editingEmployee) return;

    // Check if role has changed
    const roleChanged = values.role !== editingEmployee.role;

    if (roleChanged) {
      // Prompt confirmation
      setPendingValues(values);
      setIsConfirmRoleOpen(true);
    } else {
      // Update directly (department and/or status changes)
      performUpdates(values);
    }
  };

  // Perform API updates
  const performUpdates = async (values: EmployeeEditValues) => {
    if (!editingEmployee) return;

    try {
      const deptId = (values.departmentId === "none" || !values.departmentId) ? null : values.departmentId;

      // Call status update if changed
      if (values.status !== editingEmployee.status) {
        await updateStatusMutation.mutateAsync({
          id: editingEmployee.id,
          status: values.status,
        });
      }

      // Call role update if changed (includes department head logic)
      if (values.role !== editingEmployee.role) {
        await updateRoleMutation.mutateAsync({
          id: editingEmployee.id,
          role: values.role,
          departmentId: deptId,
        });
      } else if (deptId !== editingEmployee.departmentId) {
        // If role is unchanged but department changed
        await updateDeptMutation.mutateAsync({
          id: editingEmployee.id,
          departmentId: deptId,
        });
      }

      setIsEditOpen(false);
      setIsConfirmRoleOpen(false);
      setPendingValues(null);
    } catch {
      // Errors handled by mutation hooks (sonner toasts)
    }
  };

  const handleRoleConfirm = () => {
    if (pendingValues) {
      performUpdates(pendingValues);
    }
  };

  // Resolve Department Name
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return "Unassigned";
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : "Unassigned";
  };

  // Sorting helper
  const handleSort = (field: "name" | "email" | "role" | "status" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Role Badge Styling
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-950/40 text-purple-300 border-purple-900/30 rounded-full";
      case "ASSET_MANAGER":
        return "bg-blue-950/40 text-blue-300 border-blue-900/30 rounded-full";
      case "DEPARTMENT_HEAD":
        return "bg-amber-950/40 text-amber-300 border-amber-900/30 rounded-full";
      default:
        return "bg-surface-2 text-ink-muted border border-hairline rounded-full";
    }
  };

  const isSaving =
    updateRoleMutation.isPending ||
    updateDeptMutation.isPending ||
    updateStatusMutation.isPending;

  // Active departments to populate selection dropdown
  const activeDepartments = useMemo(() => {
    return departments.filter((d) => d.status === "ACTIVE");
  }, [departments]);

  const isSelf = editingEmployee?.id === currentUser?.id;

  const resetFilters = () => {
    setSearchTerm("");
    setDeptFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        {/* Search */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs text-ink-subtle font-medium">Search by Name or Email</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
            <Input
              placeholder="Type name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-surface-1 border-hairline text-ink placeholder:text-ink-subtle w-full focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
            />
          </div>
        </div>

        {/* Filter Department */}
        <div className="space-y-1.5">
          <Label className="text-xs text-ink-subtle font-medium">Department</Label>
          <Select value={deptFilter} onValueChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="bg-surface-1 border-hairline text-ink">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="none">Unassigned</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Role */}
        <div className="space-y-1.5">
          <Label className="text-xs text-ink-subtle font-medium">Role</Label>
          <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="bg-surface-1 border-hairline text-ink">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="ASSET_MANAGER">ASSET_MANAGER</SelectItem>
              <SelectItem value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</SelectItem>
              <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Status / Reset */}
        <div className="flex gap-2 items-center">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs text-ink-subtle font-medium">Status</Label>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="bg-surface-1 border-hairline text-ink">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || deptFilter !== "all" || roleFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-hairline hover:bg-surface-2 text-ink-subtle hover:text-ink shrink-0 h-9 px-3 mt-5 cursor-pointer"
              title="Reset Filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <Card className="border border-hairline bg-surface-1 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-surface-2/50 text-ink-subtle text-xs font-medium uppercase tracking-[0.4px]">
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      Name
                      {sortBy === "name" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1.5">
                      Email
                      {sortBy === "email" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4">Department</th>
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1.5">
                      Role
                      {sortBy === "role" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      Status
                      {sortBy === "status" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {isLoadingEmployees || isLoadingDepts ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-32 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-48 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20 bg-surface-2 rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-16 bg-surface-2 rounded-full" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-16 bg-surface-2 ml-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 py-6">
                        <Users className="h-10 w-10 text-slate-600 mb-2" />
                        <span className="font-semibold text-slate-400">No employees found</span>
                        <span className="text-xs text-slate-500">Try adjusting your search criteria or filter options.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, idx) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-surface-2/30 transition-colors text-sm text-ink-muted font-medium group animate-reveal opacity-0 [animation-fill-mode:forwards]"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center border border-hairline font-semibold text-xs text-ink-muted">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-ink font-semibold -tracking-body">
                            {emp.name} {emp.id === currentUser?.id && <span className="text-xs text-ink-subtle italic font-normal ml-1">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-ink-subtle font-normal">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-ink-tertiary" />
                          {emp.email}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-ink-muted">
                          <Building className="h-3.5 w-3.5 text-ink-tertiary" />
                          {getDeptName(emp.departmentId)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(
                            emp.role
                          )}`}
                        >
                          <Shield className="h-3 w-3" />
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            emp.status === "ACTIVE"
                              ? "bg-success-green/10 text-success-green border-success-green/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOpen(emp)}
                            className="h-8 px-3 border-hairline hover:bg-surface-2 text-ink-subtle hover:text-ink cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-subtle">
          <span>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
            {meta.total} total employees)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
              className="border-hairline hover:bg-surface-2 text-ink-muted disabled:opacity-40"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
              className="border-hairline hover:bg-surface-2 text-ink-muted disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg bg-canvas border border-hairline shadow-[0_16px_48px_-8px_rgba(5,0,56,0.12)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Manage Employee Settings</DialogTitle>
            <DialogDescription className="text-ink-subtle">
              Update the organizational properties, access roles, and active status for{" "}
              <strong className="text-ink font-semibold">{editingEmployee?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            {/* Department Selector */}
            <div className="space-y-2">
              <Label htmlFor="departmentId" className="text-sm font-medium text-ink-muted">
                Assigned Department
              </Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger className="bg-surface-2 border-hairline text-ink">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned / Freelance</SelectItem>
                      {activeDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Role Selector (ONLY FOR ADMIN) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="role" className="text-sm font-medium text-ink-muted">
                  Access Role
                </Label>
                {isSelf && (
                  <span className="text-[10px] text-amber-500 font-medium italic">
                    Self-editing role blocked
                  </span>
                )}
              </div>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSelf} // Prevent editing your own role
                  >
                    <SelectTrigger className="bg-surface-2 border-hairline text-ink disabled:opacity-50">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="ASSET_MANAGER">ASSET_MANAGER</SelectItem>
                      <SelectItem value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</SelectItem>
                      <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {watchedRole === "DEPARTMENT_HEAD" && (
                <p className="text-[11px] text-amber-400 font-medium">
                  Note: Assigning DEPARTMENT_HEAD will also set the user as the head of the selected department in the database.
                </p>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-ink-muted">
                Account Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-surface-2 border-hairline text-ink">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <DialogFooter className="pt-6 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-hairline hover:bg-surface-2 text-ink-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary-hover text-on-primary font-medium cursor-pointer rounded-full"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmRoleOpen}
        onClose={() => {
          setIsConfirmRoleOpen(false);
          setPendingValues(null);
        }}
        onConfirm={handleRoleConfirm}
        title="Confirm Role Change"
        description={`Are you sure you want to change ${editingEmployee?.name}'s role from "${editingEmployee?.role}" to "${pendingValues?.role}"? This will modify their access privileges immediately.`}
        confirmText="Confirm Change"
        isLoading={isSaving}
      />
    </div>
  );
};
