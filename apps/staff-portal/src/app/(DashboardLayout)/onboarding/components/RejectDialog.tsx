"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Clock,
  XCircle,
  Mail,
  FileText,
  ArrowRight,
  FileX,
  UserX,
  ShieldX,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSection } from "@/app/(DashboardLayout)/users/components/AdminSection";
import { RejectOnboardingInput, rejectOnboardingSchema } from "@/lib/api/onboarding";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from "@/lib/utils";
import { useAllUsers } from "@/app/context/UnifiedUserDataContext";

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: (onboardingId: number, reason: string) => Promise<void> | void;
    userName: string;
    onboardingId: number;
    userId?: number | null;
    userUuid?: string | null;
}

const QUICK_REASONS = [
  {
    id: "incomplete",
    label: "Incomplete Application",
    icon: FileX,
    description: "Missing required information",
  },
  {
    id: "unverified",
    label: "Unverified Identity",
    icon: UserX,
    description: "Unable to verify user identity",
  },
  {
    id: "policy",
    label: "Policy Violation",
    icon: ShieldX,
    description: "Does not meet policy requirements",
  },
  {
    id: "duplicate",
    label: "Duplicate Account",
    icon: Users,
    description: "Account already exists",
  },
];

const MIN_CHARS = 5;
const MAX_CHARS = 500;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const RejectDialog = ({
    open,
    onOpenChange,
    onReject,
    userName,
    userId,
    userUuid,
    onboardingId,
}: RejectDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RejectOnboardingInput>({
        resolver: zodResolver(rejectOnboardingSchema as any),
    });
    
    const { getUserById, getUserByUuid, getUserByName, getUserAvatarUrl } = useAllUsers();
    
    // Try multiple lookup strategies (priority: UUID > ID > Name)
    const user = userUuid ? getUserByUuid(userUuid) : 
                 userId ? getUserById(userId) : 
                 getUserByName(userName);
    
    const avatarUrl = getUserAvatarUrl(user);

    const rejectionReason = watch("rejectionReason") || "";
    const characterCount = rejectionReason.length;
    const isValidLength = characterCount >= MIN_CHARS && characterCount <= MAX_CHARS;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset();
            setSelectedCategory(null);
        }
    }, [open, reset]);

    const onSubmit = async (data: RejectOnboardingInput) => {
        try {
            await onReject(onboardingId, data.rejectionReason);
            reset();
            // Close dialog on successful rejection
            onOpenChange(false);
        } catch (error) {
            // Error is surfaced by the parent handler via toast; keep dialog open.
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        reset();
        onOpenChange(false);
    };

    const getCounterStyles = () => {
        if (characterCount < MIN_CHARS) return "text-muted-foreground";
        if (characterCount >= MAX_CHARS) return "text-destructive font-medium";
        if (characterCount >= MAX_CHARS * 0.9) return "text-amber-500";
        return "text-primary";
    };

    const handleCategorySelect = (categoryId: string) => {
        const category = QUICK_REASONS.find((r) => r.id === categoryId);
        if (category) {
            // Always overwrite the textbox with the selected category description
            setValue("rejectionReason", category.description, { shouldValidate: true });
            setSelectedCategory(categoryId);
        }
    };

    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto gap-0 overflow-hidden rounded-xl sm:rounded-2xl border-0 p-0 shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>Reject User Onboarding</DialogTitle>
                </VisuallyHidden>
                    {/* Destructive Gradient Header */}
                <div
                    className={cn(
                        "relative overflow-hidden",
                        "bg-gradient-to-br from-rose-500/90 via-red-500/85 to-rose-600/90",
                        "dark:from-rose-600/80 dark:via-red-600/75 dark:to-rose-700/80",
                        "px-4 sm:px-6 pb-4 sm:pb-6 pt-6 sm:pt-8"
                    )}
                >
                    {/* Decorative blur orbs */}
                    <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl" />

                    {/* Animated Warning Icon */}
                    <div className="mb-3 sm:mb-4 flex justify-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative"
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-amber-400/40 blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.4, 0.6, 0.4],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <div className="relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Header Text */}
                    <div className="text-center">
                        <h2 className="text-lg sm:text-xl font-bold text-white">Reject User</h2>
                        <p className="mt-1 text-xs sm:text-sm text-white/80">
                            You are about to reject this registration
                        </p>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4 sm:space-y-5 p-4 sm:p-6"
                    >
                        {/* User Card */}
                        <motion.div
                            variants={itemVariants}
                            className={cn(
                                "relative overflow-hidden rounded-xl",
                                "bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20",
                                "border border-border/50",
                                "p-3 sm:p-4"
                            )}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border/50 shrink-0">
                                    <AvatarImage src={avatarUrl || undefined} alt={userName} />
                                    <AvatarFallback className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs sm:text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                    <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                                        {userName}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                        Pending Review
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 sm:px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    <span className="hidden sm:inline">Awaiting Review</span>
                                    <span className="sm:hidden">Pending</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Rejection Reason Section */}
                        <motion.div variants={itemVariants}>
                            <AdminSection title="Rejection Reason">
                                {/* Quick Reason Chips */}
                                <div className="mb-4">
                                    <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                                        Quick Select (Optional)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {QUICK_REASONS.map((category) => {
                                            const Icon = category.icon;
                                            const isSelected = selectedCategory === category.id;
                                            return (
                                                <motion.button
                                                    key={category.id}
                                                    type="button"
                                                    onClick={() => handleCategorySelect(category.id)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "relative flex items-center gap-2 rounded-lg border p-2 sm:p-2.5 text-left transition-all duration-200",
                                                        isSelected
                                                            ? "border-destructive bg-destructive/5 ring-2 ring-destructive/20"
                                                            : "border-border/50 bg-muted/30 hover:border-destructive/50 hover:bg-muted/50"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                                            isSelected
                                                                ? "bg-destructive/10 text-destructive"
                                                                : "bg-muted text-muted-foreground"
                                                        )}
                                                    >
                                                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "text-xs font-medium leading-tight",
                                                            isSelected ? "text-destructive" : "text-foreground"
                                                        )}
                                                    >
                                                        {category.label}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Textarea with Counter */}
                                <div>
                                    <div className="mb-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Detailed Reason <span className="text-destructive">*</span>
                                        </label>
                                        <span className={cn("text-xs tabular-nums", getCounterStyles())}>
                                            {characterCount}/{MAX_CHARS}
                                        </span>
                                    </div>
                                    <Textarea
                                        {...register("rejectionReason")}
                                        placeholder="Please explain why this user is being rejected..."
                                        className={cn(
                                            "min-h-[100px] sm:min-h-[120px] resize-none rounded-lg sm:rounded-xl border-border/50 bg-muted/30",
                                            "focus:border-destructive/50 focus:ring-destructive/20",
                                            "placeholder:text-muted-foreground/60 text-sm"
                                        )}
                                    />
                                    <div className="mt-1.5 space-y-1">
                                        {errors.rejectionReason && (
                                            <p className="text-xs text-destructive">{errors.rejectionReason.message}</p>
                                        )}
                                        {!errors.rejectionReason && characterCount > 0 && characterCount < MIN_CHARS && (
                                            <p className="text-xs text-warning">
                                                Please provide at least {MIN_CHARS} characters for the rejection reason.
                                            </p>
                                        )}
                                        {!errors.rejectionReason && characterCount === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Minimum {MIN_CHARS} characters required
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </AdminSection>
                        </motion.div>

                        {/* Action Preview Section */}
                        <motion.div variants={itemVariants}>
                            <AdminSection title="Action Preview">
                                <div
                                    className={cn(
                                        "relative overflow-hidden rounded-xl",
                                        "bg-gradient-to-br from-destructive/5 via-rose-50/50 to-destructive/5",
                                        "dark:from-destructive/10 dark:via-rose-950/30 dark:to-destructive/10",
                                        "border border-destructive/20",
                                        "p-4"
                                    )}
                                >
                                    <div className="mb-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-destructive">
                                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        This action will:
                                    </div>

                                    <ul className="space-y-2">
                                        {[
                                            { icon: XCircle, text: "Reject the user from using the system" },
                                            { icon: Mail, text: "User will receive the rejection reason" },
                                            { icon: FileText, text: "Log this action in the audit trail" },
                                        ].map((item, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                className="flex items-start sm:items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground"
                                            >
                                                <item.icon className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5 sm:mt-0" />
                                                <span>{item.text}</span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* Status Transition */}
                                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 rounded-lg bg-background/60 p-2.5 sm:p-3">
                                        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 sm:px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            <Clock className="h-3 w-3" />
                                            Pending
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                                        <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 sm:px-2.5 py-1 text-xs font-medium text-destructive">
                                            <XCircle className="h-3 w-3" />
                                            Rejected
                                        </div>
                                    </div>
                                </div>
                            </AdminSection>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <DialogFooter className="border-t border-border/50 bg-muted/30 px-4 sm:px-6 py-3 sm:py-4 flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="gap-2 w-full sm:w-auto order-2 sm:order-1"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValidLength}
                            className={cn(
                                "relative gap-2 overflow-hidden w-full sm:w-auto order-1 sm:order-2",
                                "bg-gradient-to-r from-rose-500 to-red-600",
                                "hover:from-rose-600 hover:to-red-700",
                                "text-white shadow-lg shadow-rose-500/25",
                                "disabled:opacity-50 disabled:shadow-none"
                            )}
                        >
                            {/* Animated shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "linear",
                                    repeatDelay: 3,
                                }}
                            />
                            <AlertTriangle className="relative h-4 w-4" />
                            <span className="relative">Confirm Rejection</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RejectDialog;