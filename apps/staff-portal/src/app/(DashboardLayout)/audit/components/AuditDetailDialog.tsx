import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminSection } from "@/app/(DashboardLayout)/users/components/AdminSection";
import { AdminInfoCard } from "@/app/(DashboardLayout)/users/components/AdminInfoCard";
import { AuditDialogHeader } from "./AuditDialogHeader";
import { useAuditEntry, AuditEntryData } from "@/hooks/useAuditData";
import { Tag, Zap, Shield, UserCircle, Calendar, FileText } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { AuditEntry } from "../types";

import { User } from "@/lib/api/auth";

interface AuditDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string | null;
  auditEntries: AuditEntry[];
  users: User[];
}

export function AuditDetailDialog({
  open,
  onOpenChange,
  entryId,
  auditEntries,
  users,
}: AuditDetailDialogProps) {
  const { data: entry, isLoading } = useAuditEntry(entryId, auditEntries, users);

  if (!entryId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Audit Log Details</DialogTitle>
        </VisuallyHidden>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : entry ? (
          <>
            {/* Header with user info */}
            <AuditDialogHeader
              avatarUrl={entry.user.avatarUrl}
              name={entry.user.name}
              email={entry.user.email}
              department={entry.user.department}
              date={entry.date}
            />

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Event Details Section */}
              <AdminSection title="Event Details">
                <div className="grid grid-cols-3 gap-3">
                  <AdminInfoCard
                    icon={Tag}
                    label="Type"
                    value={entry.type}
                    index={0}
                  />
                  <AdminInfoCard
                    icon={Zap}
                    label="Action"
                    value={entry.action}
                    index={1}
                  />
                  <AdminInfoCard
                    icon={Shield}
                    label="Role"
                    value={entry.role || "—"}
                    index={2}
                  />
                </div>
              </AdminSection>

              {/* Audit Trail Section */}
              <AdminSection title="Audit Trail">
                <div className="grid grid-cols-2 gap-3">
                  <AdminInfoCard
                    icon={UserCircle}
                    label="Performed By"
                    value={entry.performedBy}
                    index={3}
                  />
                  <AdminInfoCard
                    icon={Calendar}
                    label="Date & Time"
                    value={
                      <>
                        {entry.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        <span className="text-muted-foreground">
                          {entry.date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </>
                    }
                    index={4}
                  />
                </div>

                {/* Full Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: 5 * 0.04,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="rounded-lg border border-border/40 bg-card p-4 transition-all duration-200 hover:border-border/60 hover:shadow-sm"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                      Details
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {entry.details.split('\n').filter(line => line.trim()).map((line, index) => (
                      <p key={index} className="text-sm leading-relaxed text-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              </AdminSection>
            </div>

            {/* Footer */}
            <DialogFooter className="border-t border-border/50 bg-muted/30 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Entry not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

