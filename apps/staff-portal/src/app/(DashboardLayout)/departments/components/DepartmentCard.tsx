"use client"

import { motion } from "framer-motion";
import { Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepartmentBadge } from "@/app/(DashboardLayout)/audit/components/DepartmentBadge";
import { Department } from "@/hooks/useDepartmentData";
import { format } from "date-fns";

const colorIndicatorMap: Record<string, string> = {
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
};

interface DepartmentCardProps {
  department: Department;
  index: number;
  viewMode: "grid" | "list";
  onOpenEditDialog: (department: Department) => void;
}

export function DepartmentCard({
  department,
  index,
  viewMode,
  onOpenEditDialog,
}: DepartmentCardProps) {
  const handleCardClick = () => {
    onOpenEditDialog(department);
  };

  const isGrid = viewMode === "grid";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        layout: { duration: 0.2 },
      }}
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50",
        "bg-card/80 backdrop-blur-sm",
        "transition-all duration-200 hover:border-border hover:shadow-lg",
        "cursor-pointer",
        isGrid ? "flex flex-col" : "flex flex-row items-center"
      )}
    >
      {/* Color Indicator */}
      <div
        className={cn(
          colorIndicatorMap[department.colorScheme] || "bg-muted",
          isGrid ? "h-2 w-full" : "h-full w-2 self-stretch"
        )}
      />

      {/* Content */}
      <div className={cn("flex-1 p-4", isGrid ? "" : "flex items-center gap-6")}>
        {/* Header */}
        <div className={cn("flex items-start justify-between", isGrid ? "mb-3" : "flex-1")}>
          <div className={cn("space-y-1", isGrid ? "" : "flex-1")}>
            <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
              {department.name}
            </h3>
            {department.description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  isGrid ? "line-clamp-2" : "line-clamp-1 max-w-md"
                )}
              >
                {department.description}
              </p>
            )}
          </div>

          {department.shortCode && (
            <span className="ml-3 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary shadow-sm">
              {department.shortCode.toUpperCase()}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div
          className={cn(
            "flex items-center gap-4 text-xs text-muted-foreground",
            isGrid ? "mt-4 pt-3 border-t border-border/50" : ""
          )}
        >
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{department.memberCount || 0} members</span>
          </div>
          {department.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(department.createdAt), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {/* Badge Preview */}
        {isGrid && (
          <div className="mt-3">
            <DepartmentBadge department={department.name} size="md" />
          </div>
        )}
      </div>

      {/* List view badge */}
      {!isGrid && (
        <div className="pr-4">
          <DepartmentBadge department={department.name} size="md" />
        </div>
      )}
    </motion.div>
  );
}
