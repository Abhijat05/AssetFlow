import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeactivateCategory,
} from "../hooks/useOrganization";
import type { AssetCategory } from "../types";
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
  Tag,
  X,
  PlusCircle,
  Wrench,
} from "lucide-react";

// Form Schema
const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const CategoryTab: React.FC = () => {
  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // Mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<AssetCategory | null>(null);

  // Dynamic Custom Fields State
  const [customFieldsList, setCustomFieldsList] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [fieldError, setFieldError] = useState("");

  // Form Setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
  });

  // Open Dialog for creating Category
  const handleCreateOpen = () => {
    setEditingCategory(null);
    setCustomFieldsList([]);
    setNewFieldName("");
    setFieldError("");
    reset({
      name: "",
      description: "",
      status: "ACTIVE",
    });
    setIsFormOpen(true);
  };

  // Open Dialog for editing Category
  const handleEditOpen = (category: AssetCategory) => {
    setEditingCategory(category);
    const fields = category.customFields ? Object.keys(category.customFields) : [];
    setCustomFieldsList(fields);
    setNewFieldName("");
    setFieldError("");
    reset({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setIsFormOpen(true);
  };

  // Dynamic Fields Add/Remove helpers
  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) {
      setFieldError("Field name cannot be empty");
      return;
    }
    if (customFieldsList.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setFieldError("A field with this name already exists");
      return;
    }
    setCustomFieldsList([...customFieldsList, trimmed]);
    setNewFieldName("");
    setFieldError("");
  };

  const handleRemoveField = (indexToRemove: number) => {
    setCustomFieldsList(customFieldsList.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Create/Edit
  const onSubmit = async (values: CategoryFormValues) => {
    // Construct custom fields record
    const customFieldsRecord: Record<string, string> = {};
    customFieldsList.forEach((field) => {
      customFieldsRecord[field] = "text";
    });

    const payload = {
      name: values.name,
      description: values.description || null,
      customFields: customFieldsList.length > 0 ? customFieldsRecord : null,
    };

    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        ...payload,
        status: values.status,
      });
    } else {
      await createCategoryMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  // Deactivate Category Action
  const handleDeactivate = async () => {
    if (deactivatingCategory) {
      await deactivateCategoryMutation.mutateAsync(deactivatingCategory.id);
      setDeactivatingCategory(null);
    }
  };

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const lower = searchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(lower) ||
        (cat.description && cat.description.toLowerCase().includes(lower))
    );
  }, [categories, searchTerm]);

  // Paginated Categories
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Top Search & Add Category */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <Input
            placeholder="Search categories..."
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
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-medium flex items-center justify-center gap-2 cursor-pointer transition-all rounded-full"
        >
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="border border-hairline bg-surface-1 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-surface-2/50 text-ink-subtle text-xs font-medium uppercase tracking-[0.4px]">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Custom Fields</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {isLoadingCategories ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4"><Skeleton className="h-4 w-40 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-60 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32 bg-surface-2" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-16 bg-surface-2 rounded-full" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-16 bg-surface-2 ml-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 py-6">
                        <Tag className="h-10 w-10 text-slate-600 mb-2" />
                        <span className="font-semibold text-slate-400">No categories found</span>
                        <span className="text-xs text-slate-500">Create a new category or adjust your search filter.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category, idx) => {
                    const fields = category.customFields ? Object.keys(category.customFields) : [];
                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-surface-2/30 transition-colors text-sm text-ink-muted font-medium group animate-reveal opacity-0 [animation-fill-mode:forwards]"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <td className="p-4 font-semibold text-ink -tracking-body">{category.name}</td>
                        <td className="p-4 text-ink-subtle font-normal">
                          {category.description || <span className="text-ink-tertiary italic text-xs">No description</span>}
                        </td>
                        <td className="p-4">
                          {fields.length === 0 ? (
                            <span className="text-ink-tertiary text-xs italic">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {fields.map((f) => (
                                <span
                                  key={f}
                                  className="inline-flex items-center px-2 py-0.5 rounded bg-surface-2 text-ink-muted border border-hairline text-xs font-semibold"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              category.status === "ACTIVE"
                                ? "bg-success-green/10 text-success-green border-success-green/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {category.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOpen(category)}
                              className="h-8 w-8 p-0 border-hairline hover:bg-surface-2 text-ink-subtle hover:text-ink cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={category.status === "INACTIVE"}
                              onClick={() => setDeactivatingCategory(category)}
                              className="h-8 w-8 p-0 border-hairline text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
            {filteredCategories.length} total)
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
              {editingCategory ? "Edit Asset Category" : "Create Asset Category"}
            </DialogTitle>
            <DialogDescription className="text-ink-subtle">
              Configure attributes, descriptors, and custom tracking fields for this category.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-ink-muted">
                Category Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-surface-2 border-hairline text-ink placeholder:text-ink-subtle focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
                placeholder="e.g. IT Equipment, Furniture, Vehicles"
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
                placeholder="Details about assets falling into this category"
              />
              {errors.description && (
                <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Status (Only on Edit) */}
            {editingCategory && (
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

            {/* Dynamic Custom Fields Section */}
            <div className="space-y-3 pt-2 border-t border-hairline">
              <Label className="text-sm font-medium text-ink-muted flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-ink-subtle" />
                Custom Attributes / Fields
              </Label>
              <p className="text-xs text-ink-subtle">
                Define dynamic metadata fields (e.g. Warranty Period, Screen Size) that assets under this category will track.
              </p>

              {/* Add field input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Field name (e.g. RAM, Screen Size)"
                    value={newFieldName}
                    onChange={(e) => {
                      setNewFieldName(e.target.value);
                      setFieldError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddField();
                      }
                    }}
                    className="bg-surface-2 border-hairline text-ink focus-visible:ring-primary-focus focus-visible:border-hairline-strong"
                  />
                  {fieldError && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
                </div>
                <Button
                  type="button"
                  onClick={handleAddField}
                  variant="outline"
                  className="border-hairline hover:bg-surface-2 text-ink-muted shrink-0 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 mr-1 text-primary" />
                  Add
                </Button>
              </div>

              {/* List of fields */}
              <div className="flex flex-wrap gap-2 pt-2">
                {customFieldsList.length === 0 ? (
                  <span className="text-xs text-ink-tertiary italic">No custom fields defined yet.</span>
                ) : (
                  customFieldsList.map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded bg-surface-2 border border-hairline text-xs font-semibold text-ink-muted animate-reveal"
                    >
                      {field}
                      <Button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        variant="ghost"
                        className="h-4 w-4 p-0 text-ink-subtle hover:text-destructive cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <DialogFooter className="pt-6 gap-2 sm:justify-end">
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
                className="bg-primary hover:bg-primary-hover text-white font-medium cursor-pointer rounded-full"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                  ? "Save Changes"
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <ConfirmationDialog
        isOpen={deactivatingCategory !== null}
        onClose={() => setDeactivatingCategory(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Asset Category"
        description={`Are you sure you want to deactivate the asset category "${deactivatingCategory?.name}"? New assets will not be able to assign this category.`}
        confirmText="Deactivate"
        isLoading={deactivateCategoryMutation.isPending}
      />
    </div>
  );
};
