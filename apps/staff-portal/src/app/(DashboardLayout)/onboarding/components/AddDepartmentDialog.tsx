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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAddDepartment, colorSchemeOptions } from "@/hooks/useDepartmentData";
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge";
import { cn } from "@/lib/utils";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  colorScheme: z.enum(["cyan", "pink", "emerald", "violet", "amber", "slate"]),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDepartmentDialog({ open, onOpenChange }: AddDepartmentDialogProps) {
  const { toast } = useToast();
  const addDepartment = useAddDepartment();

  const generateShortCodeFromName = (name: string): string => {
    if (!name.trim()) return "";
    const words = name.trim().split(/\s+/);
    return words
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 10);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    resolver: (zodResolver as any)(departmentSchema),
    defaultValues: {
      name: "",
      colorScheme: "cyan",
    },
  });

  const watchedName = watch("name");
  const watchedColorScheme = watch("colorScheme");

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      await addDepartment.mutateAsync({
        name: data.name,
        shortCode: generateShortCodeFromName(data.name),
        colorScheme: data.colorScheme,
      });
      toast({
        title: "Department created",
        description: `"${data.name}" has been added successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Department</DialogTitle>
          <DialogDescription>
            Create a new department for your organization
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

            <div className="space-y-3">
              <Label>Color Theme</Label>
              <RadioGroup
                value={watchedColorScheme}
                onValueChange={(value) =>
                  setValue("colorScheme", value as DepartmentFormData["colorScheme"])
                }
                className="grid grid-cols-3 gap-3"
              >
                {colorSchemeOptions.map((color) => (
                  <Label
                    key={color.value}
                    htmlFor={color.value}
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
                      id={color.value}
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
                department={watchedName || "Department Name"} 
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

