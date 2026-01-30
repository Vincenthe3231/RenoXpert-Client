import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDepartment } from "@/lib/api/auth/auth.schemas";

type ColorScheme = "cyan" | "pink" | "emerald" | "violet" | "amber" | "slate";

interface DepartmentBadgeProps {
  department: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
  colorScheme?: ColorScheme;
}

const departmentConfig: Record<string, { bg: string; border: string; text: string }> = {
  "Owner Sales": {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-400/30 dark:border-emerald-400/40",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  "Renovation": {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-400/30 dark:border-blue-400/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  "Technician": {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    border: "border-cyan-400/30 dark:border-cyan-400/40",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  "Finance & Account": {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-400/30 dark:border-amber-400/40",
    text: "text-amber-600 dark:text-amber-400",
  },
};

const colorSchemeConfig: Record<ColorScheme, { bg: string; border: string; text: string }> = {
  cyan: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    border: "border-cyan-400/30 dark:border-cyan-400/40",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  pink: {
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    border: "border-pink-400/30 dark:border-pink-400/40",
    text: "text-pink-600 dark:text-pink-400",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-400/30 dark:border-emerald-400/40",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    border: "border-violet-400/30 dark:border-violet-400/40",
    text: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-400/30 dark:border-amber-400/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  slate: {
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-400/30 dark:border-slate-400/40",
    text: "text-slate-600 dark:text-slate-400",
  },
};

const defaultConfig = {
  bg: "bg-muted/50",
  border: "border-border/50",
  text: "text-muted-foreground",
};

export function DepartmentBadge({ department, size = "sm", className, colorScheme }: DepartmentBadgeProps) {
  if (!department) return null;

  // If colorScheme is provided, use it; otherwise fall back to departmentConfig
  const config = colorScheme 
    ? colorSchemeConfig[colorScheme] 
    : (departmentConfig[department] || defaultConfig);
  
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all duration-200",
        config.bg,
        config.border,
        config.text,
        sizeStyles[size],
        className
      )}
    >
      <Building2 className={iconSize} />
      {department}
    </span>
  );
}

