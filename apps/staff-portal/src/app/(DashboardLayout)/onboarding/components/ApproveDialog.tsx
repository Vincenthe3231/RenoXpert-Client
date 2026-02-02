import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, Building2, Check, X, Clock, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminDialogHeader } from "@/app/(DashboardLayout)/users/components/AdminDialogHeader";
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge";
import { useDepartments } from "@/hooks/useDepartmentData";
import { StaffType } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (onboardingId: number, staffType: StaffType, department?: string) => void;
  userName: string;
  onboardingId: number;
  isLoading?: boolean;
}

const staffTypeOptions: {
  value: StaffType;
  label: string;
  description: string;
  icon: typeof Users;
  gradient: string;
  iconBg: string;
}[] = [
  {
    value: "staff",
    label: "Staff",
    description: "Standard access to system features and resources",
    icon: Users,
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full system access with management capabilities",
    icon: ShieldCheck,
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
  },
];

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const ApproveDialog = ({ 
  open, 
  onOpenChange, 
  onApprove, 
  userName, 
  onboardingId, 
  isLoading = false 
}: ApproveDialogProps) => {
  const [staffType, setStaffType] = useState<StaffType>("staff");
  const [departmentId, setDepartmentId] = useState<string>("");
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStaffType("staff");
      setDepartmentId("");
    }
  }, [open]);

  const selectedDepartment = departments?.find((d) => d.id === departmentId);
  const isFormValid = staffType && departmentId;

  const handleApprove = () => {
    if (!isFormValid || !selectedDepartment) return;
    onApprove(onboardingId, staffType, selectedDepartment.name);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-2xl border-border/40 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Approve User Onboarding</DialogTitle>
        </VisuallyHidden>
        {/* Gradient Header */}
        <AdminDialogHeader
          avatarUrl={undefined}
          name={userName}
          email=""
          rightContent={
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm border border-white/20"
            >
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              Pending Approval
            </motion.div>
          }
        />

        {/* Form Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 p-6"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Assign Role & Access</h3>
              <p className="text-xs text-muted-foreground">Configure permissions for this user</p>
            </div>
          </motion.div>

          {/* Staff Type Selection */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Staff Type
            </Label>

            {/* Radio Card Group */}
            <div className="grid grid-cols-2 gap-3">
              {staffTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = staffType === option.value;

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStaffType(option.value)}
                    disabled={isLoading}
                    className={cn(
                      "relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-accent/20",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Gradient overlay for selected */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                        option.gradient,
                        isSelected && "opacity-100"
                      )}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                            isSelected
                              ? cn(option.iconBg, "text-white shadow-lg")
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-foreground">
                            {option.label}
                          </span>
                        </div>

                        {/* Selection indicator */}
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground scale-110"
                              : "border-muted-foreground/30 bg-background"
                          )}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-3 w-3" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-[52px]">
                        {option.description}
                      </p>
                    </div>

                    {/* Glow effect for selected */}
                    {isSelected && (
                      <motion.div
                        layoutId="selectedGlow"
                        className="absolute inset-0 rounded-xl ring-2 ring-primary/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Department Selector */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Department
            </Label>
            {departmentsLoading ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : (
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={isLoading}>
                <SelectTrigger className="h-12 rounded-xl bg-card/60 border-border/60 backdrop-blur-sm hover:bg-accent/30 transition-colors">
                  <SelectValue placeholder="Select department...">
                    {selectedDepartment && (
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background",
                            selectedDepartment.colorScheme === "cyan" && "bg-cyan-500 ring-cyan-500/30",
                            selectedDepartment.colorScheme === "pink" && "bg-pink-500 ring-pink-500/30",
                            selectedDepartment.colorScheme === "emerald" && "bg-emerald-500 ring-emerald-500/30",
                            selectedDepartment.colorScheme === "violet" && "bg-violet-500 ring-violet-500/30",
                            selectedDepartment.colorScheme === "amber" && "bg-amber-500 ring-amber-500/30",
                            selectedDepartment.colorScheme === "slate" && "bg-slate-500 ring-slate-500/30"
                          )}
                        />
                        <span className="font-medium">{selectedDepartment.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 bg-popover/95 backdrop-blur-xl">
                  {departments?.map((dept) => (
                    <SelectItem 
                      key={dept.id} 
                      value={dept.id}
                      className="rounded-lg cursor-pointer focus:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            dept.colorScheme === "cyan" && "bg-cyan-500",
                            dept.colorScheme === "pink" && "bg-pink-500",
                            dept.colorScheme === "emerald" && "bg-emerald-500",
                            dept.colorScheme === "violet" && "bg-violet-500",
                            dept.colorScheme === "amber" && "bg-amber-500",
                            dept.colorScheme === "slate" && "bg-slate-500"
                          )}
                        />
                        {dept.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </motion.div>

          {/* Approval Preview Section */}
          <motion.div variants={itemVariants} className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Preview
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-border via-transparent to-transparent" />
            </div>

            <div
              className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20",
                "border border-border/50",
                "p-5"
              )}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl" />

              <div className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  After approval, <span className="font-semibold text-foreground">{userName}</span> will receive:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Role Preview */}
                  <div
                    className={cn(
                      "group rounded-xl p-4",
                      "bg-card/80 backdrop-blur-sm",
                      "border border-border/40",
                      "transition-all duration-300 hover:shadow-md hover:border-border/60"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      <ShieldCheck className="h-3 w-3" />
                      Role
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={staffType}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2"
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          staffType === "admin" 
                            ? "bg-gradient-to-br from-violet-500 to-purple-500" 
                            : "bg-gradient-to-br from-blue-500 to-cyan-500"
                        )}>
                          {staffType === "admin" ? (
                            <ShieldCheck className="h-4 w-4 text-white" />
                          ) : (
                            <Users className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground capitalize">{staffType}</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Department Preview */}
                  <div
                    className={cn(
                      "group rounded-xl p-4",
                      "bg-card/80 backdrop-blur-sm",
                      "border border-border/40",
                      "transition-all duration-300 hover:shadow-md hover:border-border/60"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      <Building2 className="h-3 w-3" />
                      Department
                    </div>
                    <AnimatePresence mode="wait">
                      {selectedDepartment ? (
                        <motion.div
                          key={selectedDepartment.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <DepartmentBadge
                            department={selectedDepartment.name}
                            size="md"
                            colorScheme={selectedDepartment.colorScheme}
                          />
                        </motion.div>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          className="text-sm text-muted-foreground italic"
                        >
                          Select above
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status Change */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "rounded-xl p-4",
                    "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent",
                    "border border-emerald-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <DialogFooter className="border-t border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!isFormValid || isLoading}
            className={cn(
              "gap-2 relative overflow-hidden",
              "bg-gradient-to-r from-primary to-secondary",
              "hover:shadow-lg hover:shadow-primary/25",
              "transition-all duration-300",
              "text-white border-0",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Check className="h-4 w-4" />
              {isLoading ? "Approving..." : "Confirm Approval"}
            </span>
            {/* Shine effect */}
            {!isLoading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveDialog;
