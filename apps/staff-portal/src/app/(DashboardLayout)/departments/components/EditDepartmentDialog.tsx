"use client";

import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  description: z.string().optional(),
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
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      colorScheme: "cyan",
    },
  });

  const watchedName = watch("name");
  const watchedColorScheme = watch("colorScheme");

  // Reset form when department changes or dialog opens
  useEffect(() => {
    if (department && open) {
      reset({
        name: department.name,
        description: department.description || "",
        colorScheme: department.colorScheme,
      });
    }
  }, [department, open, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    if (!department) return;

    try {
      await updateDepartment.mutateAsync({
        id: department.id,
        updates: {
          name: data.name,
          description: data.description || undefined,
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
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the department..."
                {...register("description")}
                className="bg-background/50 min-h-[80px] resize-none"
              />
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
                department={colorToDepartmentMap[watchedColorScheme] || "Engineering"}
                size="md"
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
