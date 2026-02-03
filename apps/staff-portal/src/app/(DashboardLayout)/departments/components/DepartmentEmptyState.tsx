import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DepartmentEmptyStateProps {
  onCreateClick: () => void;
}

export function DepartmentEmptyState({ onCreateClick }: DepartmentEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Illustrated Icon */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 max-w-sm"
      >
        <h3 className="text-xl font-semibold text-foreground">
          No departments yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Create your first department to start organizing your team structure.
        </p>
      </motion.div>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={onCreateClick} className="mt-6 gap-2">
          <Plus className="h-4 w-4" />
          Create Department
        </Button>
      </motion.div>
    </motion.div>
  );
}
