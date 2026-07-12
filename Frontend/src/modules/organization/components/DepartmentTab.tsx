import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useDepartments,
  useEmployees,
  useCreateDepartment,
  useUpdateDepartment,
  useDeactivateDepartment,
} from "../hooks/useOrganization";
import type { Department } from "../types";
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
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Building2,
  User,
} from "lucide-react";

// Form schema
const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
  departmentHeadId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

type SortField = "name" | "parent" | "head" | "status";
type SortOrder = "asc" | "desc";

export const DepartmentTab: React.FC = () => {
  // Queries
  const { data: departments = [], isLoading: isLoadingDepts } = useDepartments();
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({ limit: 1000 });
  const employees = employeesData?.data || [];

  // Mutations
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deactivateDeptMutation = useDeactivateDepartment();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deactivatingDept, setDeactivatingDept] = useState<Department | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      parentDepartmentId: null,
      departmentHeadId: null,
      status: "ACTIVE",
    },
  });

  // Open dialog for creating department
  const handleCreateOpen = () => {
    setEditingDept(null);
    reset({
      name: "",
      description: "",
      parentDepartmentId: "none",
      departmentHeadId: "none",
      status: "ACTIVE",
    });
    setIsFormOpen(true);
  };

  // Open dialog for editing department
  const handleEditOpen = (dept: Department) => {
    setEditingDept(dept);
    reset({
      name: dept.name,
      description: dept.description || "",
      parentDepartmentId: dept.parentDepartmentId || "none",
      departmentHeadId: dept.departmentHeadId || "none",
      status: dept.status,
    });
    setIsFormOpen(true);
  };

  // Submit create/edit form
  const onSubmit = async (values: DepartmentFormValues) => {
    const parentId = values.parentDepartmentId === "none" ? null : values.parentDepartmentId;
    const headId = values.departmentHeadId === "none" ? null : values.departmentHeadId;

    if (editingDept) {
      await updateDeptMutation.mutateAsync({
        id: editingDept.id,
        name: values.name,
        description: values.description || null,
        parentDepartmentId: parentId,
        departmentHeadId: headId,
        status: values.status,
      });
    } else {
      await createDeptMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        parentDepartmentId: parentId,
        departmentHeadId: headId,
      });
    }
    setIsFormOpen(false);
  };

  // Deactivate handler
  const handleDeactivate = async () => {
    if (deactivatingDept) {
      await deactivateDeptMutation.mutateAsync(deactivatingDept.id);
      setDeactivatingDept(null);
    }
  };

  // Resolve Parent Department Name
  const getParentDeptName = (parentId: string | null) => {
    if (!parentId) return "-";
    const parent = departments.find((d) => d.id === parentId);
    return parent ? parent.name : "-";
  };

  // Resolve Department Head Name
  const getHeadName = (headId: string | null) => {
    if (!headId) return "-";
    const employee = employees.find((e) => e.id === headId);
    return employee ? employee.name : "-";
  };

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filtered and Sorted Departments
  const processedDepartments = useMemo(() => {
    let result = [...departments];

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (dept) =>
          dept.name.toLowerCase().includes(lower) ||
          (dept.description && dept.description.toLowerCase().includes(lower))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string = "";
      let valB: string = "";

      if (sortField === "name") {
        valA = a.name;
        valB = b.name;
      } else if (sortField === "parent") {
        valA = getParentDeptName(a.parentDepartmentId);
        valB = getParentDeptName(b.parentDepartmentId);
      } else if (sortField === "head") {
        valA = getHeadName(a.departmentHeadId);
        valB = getHeadName(b.departmentHeadId);
      } else if (sortField === "status") {
        valA = a.status;
        valB = b.status;
      }

      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    return result;
  }, [departments, searchTerm, sortField, sortOrder, employees]);

  // Pagination logic
  const paginatedDepts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedDepartments.slice(start, start + itemsPerPage);
  }, [processedDepartments, currentPage]);

  const totalPages = Math.ceil(processedDepartments.length / itemsPerPage);

  const parentDeptOptions = useMemo(() => {
    return departments.filter(
      (dept) => dept.status === "ACTIVE" && (!editingDept || dept.id !== editingDept.id)
    );
  }, [departments, editingDept]);

  const isSubmitting = createDeptMutation.isPending || updateDeptMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-surface-1 border-hairline text-ink placeholder:text-ink-subtle w-full focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
          />
        </div>
        <Button
          onClick={handleCreateOpen}
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-on-primary font-medium flex items-center justify-center gap-2 cursor-pointer transition-all rounded-full"
        >
          <Plus className="h-4 w-4" />
          Create Department
        </Button>
      </div>

      {/* Table Card */}
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
                      Department Name
                      {sortField === "name" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("head")}
                  >
                    <div className="flex items-center gap-1.5">
                      Department Head
                      {sortField === "head" ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort("parent")}
                  >
                    <div className="flex items-center gap-1.5">
                      Parent Department
                      {sortField === "parent" ? (
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
                      {sortField === "status" ? (
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
                {isLoadingDepts || isLoadingEmployees ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-40 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-36 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-16 bg-surface-2 rounded-full" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-16 bg-surface-2 ml-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : paginatedDepts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 py-6">
                        <Building2 className="h-10 w-10 text-slate-600 mb-2" />
                        <span className="font-semibold text-slate-400">No departments found</span>
                        <span className="text-xs text-slate-500">Create a new department or adjust your search filter.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDepts.map((dept, idx) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-surface-2/30 transition-colors text-sm text-ink-muted font-medium group animate-reveal opacity-0 [animation-fill-mode:forwards]"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-ink font-semibold -tracking-body">{dept.name}</span>
                          {dept.description && (
                            <span className="text-xs text-ink-subtle line-clamp-1 mt-0.5 max-w-xs">{dept.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-ink-muted">
                          {dept.departmentHeadId && <User className="h-3.5 w-3.5 text-ink-subtle" />}
                          {getHeadName(dept.departmentHeadId)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-ink-muted">
                          {dept.parentDepartmentId && <Building2 className="h-3.5 w-3.5 text-ink-subtle" />}
                          {getParentDeptName(dept.parentDepartmentId)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            dept.status === "ACTIVE"
                              ? "bg-success-green/10 text-success-green border-success-green/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOpen(dept)}
                            className="h-8 w-8 p-0 border-hairline hover:bg-surface-2 text-ink-subtle hover:text-ink cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={dept.status === "INACTIVE"}
                            onClick={() => setDeactivatingDept(dept)}
                            className="h-8 w-8 p-0 border-hairline text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-subtle">
          <span>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
            {processedDepartments.length} total)
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

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-canvas border border-hairline shadow-[0_16px_48px_-8px_rgba(5,0,56,0.12)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingDept ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription className="text-ink-subtle">
              {editingDept
                ? "Update the details of the department."
                : "Fill in the details to create a new department."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Department Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-ink-muted">
                Department Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-surface-2 border-hairline text-ink placeholder:text-ink-subtle focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
                placeholder="e.g. Engineering, Human Resources"
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-ink-muted">
                Description
              </Label>
              <Input
                id="description"
                {...register("description")}
                className="bg-surface-2 border-hairline text-ink placeholder:text-ink-subtle focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
                placeholder="Brief description of the department functions"
              />
              {errors.description && (
                <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Parent Department */}
            <div className="space-y-2">
              <Label htmlFor="parentDepartmentId" className="text-sm font-medium text-ink-muted">
                Parent Department
              </Label>
              <Controller
                name="parentDepartmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger className="bg-surface-2 border-hairline text-ink">
                      <SelectValue placeholder="Select Parent Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {parentDeptOptions.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Department Head */}
            <div className="space-y-2">
              <Label htmlFor="departmentHeadId" className="text-sm font-medium text-ink-muted">
                Department Head
              </Label>
              <Controller
                name="departmentHeadId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger className="bg-surface-2 border-hairline text-ink">
                      <SelectValue placeholder="Select Department Head" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Status (Only on Edit) */}
            {editingDept && (
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-ink-muted">
                  Status
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
            )}

            <DialogFooter className="pt-4 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="border-hairline hover:bg-surface-2 text-ink-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-on-primary font-medium cursor-pointer rounded-full"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingDept
                  ? "Save Changes"
                  : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <ConfirmationDialog
        isOpen={deactivatingDept !== null}
        onClose={() => setDeactivatingDept(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Department"
        description={`Are you sure you want to deactivate the department "${deactivatingDept?.name}"? Inactive departments cannot be assigned as parent departments.`}
        confirmText="Deactivate"
        isLoading={deactivateDeptMutation.isPending}
      />
    </div>
  );
};
