"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  Department, 
  useUpdateDepartment, 
  useDeleteDepartment,
  colorSchemeOptions 
} from "@/hooks/useDepartmentData";
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortCode: z.string().min(1, "Short code is required").max(10, "Short code must be 10 characters or less"),
  colorScheme: z.enum(["cyan", "pink", "emerald", "violet", "amber", "slate"]),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  onDelete?: (department: Department) => void;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  department,
  onDelete,
}: EditDepartmentDialogProps) {
  const { toast } = useToast();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DepartmentFormData>({
    resolver: (zodResolver as any)(departmentSchema),
    defaultValues: {
      name: "",
      shortCode: "",
      colorScheme: "cyan",
    },
  });

  const watchedName = watch("name");
  const watchedShortCode = watch("shortCode");
  const watchedColorScheme = watch("colorScheme");

  // Track if shortCode was manually edited by the user
  const isManuallyEditedRef = useRef<boolean>(false);
  // Track the last name that was used to generate the shortCode
  const lastGeneratedNameRef = useRef<string>("");

  // Helper function to generate short code from name
  const generateShortCodeFromName = (name: string): string => {
    if (!name.trim()) return "";
    const words = name.trim().split(/\s+/);
    return words
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 10);
  };

  // Auto-generate short code from department name in real-time (only when name changes)
  useEffect(() => {
    if (watchedName) {
      const generatedShortCode = generateShortCodeFromName(watchedName);
      const lastGeneratedShortCode = generateShortCodeFromName(lastGeneratedNameRef.current);

      // If the short code still matches the last auto-generated value,
      // allow it to update when the name changes.
      if (watchedShortCode === lastGeneratedShortCode) {
        isManuallyEditedRef.current = false;
      }
      
      // Only auto-update if:
      // 1. ShortCode is empty, OR
      // 2. It hasn't been manually edited (isManuallyEditedRef is false)
      if (!watchedShortCode || !isManuallyEditedRef.current) {
        setValue("shortCode", generatedShortCode, { shouldValidate: true });
        lastGeneratedNameRef.current = watchedName;
        isManuallyEditedRef.current = false;
      }
    } else if (!watchedName) {
      // Clear short code if name is cleared
      setValue("shortCode", "", { shouldValidate: false });
      lastGeneratedNameRef.current = "";
      isManuallyEditedRef.current = false;
    }
  }, [watchedName, setValue]);

  // Detect manual edits to shortCode
  useEffect(() => {
    if (watchedShortCode && watchedName) {
      const generatedShortCode = generateShortCodeFromName(watchedName);
      const lastGeneratedShortCode = generateShortCodeFromName(lastGeneratedNameRef.current);
      
      // If shortCode doesn't match what would be generated from current name,
      // and it also doesn't match what was generated from the last name,
      // then it was manually edited
      if (watchedShortCode !== generatedShortCode && watchedShortCode !== lastGeneratedShortCode) {
        isManuallyEditedRef.current = true;
      } else if (watchedShortCode === generatedShortCode) {
        // If it matches what would be generated, treat as auto-generated
        isManuallyEditedRef.current = false;
        lastGeneratedNameRef.current = watchedName;
      }
    }
  }, [watchedShortCode, watchedName]);

  // Reset form when department changes or dialog opens
  useEffect(() => {
    if (department && open) {
      const initialShortCode = department.shortCode || generateShortCodeFromName(department.name);
      const expectedGeneratedShortCode = generateShortCodeFromName(department.name);
      
      reset({
        name: department.name,
        shortCode: initialShortCode,
        colorScheme: department.colorScheme,
      });
      
      // Initialize the refs: if shortCode matches what would be generated, treat as auto-generated
      // Otherwise, mark as manually edited to preserve it
      if (initialShortCode === expectedGeneratedShortCode || !department.shortCode) {
        isManuallyEditedRef.current = false;
        lastGeneratedNameRef.current = department.name;
      } else {
        // ShortCode was manually set and doesn't match generated value - preserve it
        isManuallyEditedRef.current = true;
        lastGeneratedNameRef.current = department.name;
      }
    } else if (!open) {
      // Reset refs when dialog closes
      isManuallyEditedRef.current = false;
      lastGeneratedNameRef.current = "";
    }
  }, [department, open, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    if (!department) return;

    try {
      await updateDepartment.mutateAsync({
        id: department.id,
        updates: {
          name: data.name,
          shortCode: data.shortCode,
          colorScheme: data.colorScheme,
        },
      });
      toast({
        title: "Department updated",
        description: `"${data.name}" has been updated successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Map color scheme to department name for preview
  const colorToDepartmentMap: Record<string, string> = {
    cyan: "Engineering",
    pink: "Marketing",
    emerald: "Sales",
    violet: "HR",
    amber: "Finance",
    slate: "Operations",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Department</DialogTitle>
          <DialogDescription>
            Update department details and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Department Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Department Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">
                Department Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Research & Development"
                {...register("name")}
                className="bg-background/50"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortCode">
                Short Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortCode"
                placeholder="e.g., RD"
                {...register("shortCode")}
                className="bg-background/50"
                maxLength={10}
              />
              {errors.shortCode && (
                <p className="text-xs text-destructive">{errors.shortCode.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Color Theme</Label>
              <RadioGroup
                value={watchedColorScheme}
                onValueChange={(value) =>
                  setValue("colorScheme", value as DepartmentFormData["colorScheme"], { shouldDirty: true })
                }
                className="grid grid-cols-3 gap-3"
              >
                {colorSchemeOptions.map((color) => (
                  <Label
                    key={color.value}
                    htmlFor={`edit-${color.value}`}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all",
                      "hover:bg-accent/50",
                      watchedColorScheme === color.value
                        ? "border-primary bg-primary/5"
                        : "border-border/50"
                    )}
                  >
                    <RadioGroupItem
                      value={color.value}
                      id={`edit-${color.value}`}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full shadow-sm",
                        color.class
                      )}
                    />
                    <span className="text-xs font-medium">{color.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-border/50 bg-muted/30 p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Preview
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Your department will appear as:
              </span>
              <DepartmentBadge
                department={watchedName || department?.name || "Department Name"}
                size="md"
                colorScheme={watchedColorScheme}
              />
            </div>
            {watchedName && (
              <p className="mt-2 text-xs text-muted-foreground">
                Badge will display: <span className="font-medium text-foreground">{watchedName}</span>
              </p>
            )}
          </motion.div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex items-center justify-between w-full">
              {department && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(department);
                  }}
                  disabled={isSubmitting || deleteDepartment.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
