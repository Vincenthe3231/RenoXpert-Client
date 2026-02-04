"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Building2, Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Department, useDeleteDepartment } from "@/hooks/useDepartmentData";
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge";
import { cn } from "@/lib/utils";

interface DeleteDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
}: DeleteDepartmentDialogProps) {
  const { toast } = useToast();
  const deleteDepartment = useDeleteDepartment();
  const [confirmText, setConfirmText] = useState("");

  // Reset confirm text when dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmText("");
    }
  }, [open]);

  const hasMembers = (department?.memberCount ?? 0) > 0;
  const requiresConfirmation = true; // Always require confirmation for super admin safety
  const isConfirmed = confirmText === department?.name;

  const handleDelete = async () => {
    if (!department || !isConfirmed) return;

    try {
      await deleteDepartment.mutateAsync(department.id);
      toast({
        title: "Department deleted",
        description: `"${department.name}" has been permanently deleted.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
        {/* Destructive Header */}
        <div
          className={cn(
            "relative px-6 pt-8 pb-6",
            "bg-gradient-to-br from-rose-500/90 via-red-500/85 to-rose-600/90",
            "dark:from-rose-600/80 dark:via-red-600/75 dark:to-rose-700/80"
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          <div className="relative text-center">
            {/* Animated Warning Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto mb-4 relative"
            >
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
              <div className="relative h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-white tracking-tight"
            >
              Delete Department
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-white/80 text-sm mt-1"
            >
              This action cannot be undone
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Department Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/50 bg-muted/30 p-4"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50"
                )}
              >
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <DepartmentBadge 
                    department={department.name} 
                    size="md" 
                    colorScheme={department.colorScheme}
                  />
                </div>
                {department.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {department.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{department.memberCount} members</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Warning for departments with members */}
          <AnimatePresence>
            {hasMembers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/30 p-4"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Warning: This department has {department.memberCount} active members
                    </p>
                    <p className="text-xs text-muted-foreground">
                      These members will need to be reassigned to another department.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmation Input - Always shown for super admin safety */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="confirm" className="text-sm">
              Type <span className="font-semibold text-foreground">"{department.name}"</span> to confirm deletion:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={department.name}
              className="bg-background/50"
              autoComplete="off"
            />
          </motion.div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteDepartment.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteDepartment.isPending}
            className="relative overflow-hidden"
          >
            {deleteDepartment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete Department</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
