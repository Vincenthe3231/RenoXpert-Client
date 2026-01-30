import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DepartmentBadge } from "./DepartmentBadge";
import { cn } from "@/lib/utils";

interface AuditDialogHeaderProps {
  avatarUrl?: string | null;
  name: string;
  email: string;
  department: string;
  date: Date;
  className?: string;
}

export function AuditDialogHeader({
  avatarUrl,
  name,
  email,
  department,
  date,
  className,
}: AuditDialogHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-t-lg bg-gradient-to-r from-primary to-secondary px-6 py-6",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-white/5" />
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between gap-4">
        {/* Left: Avatar and User Info */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Avatar className="h-16 w-16 ring-2 ring-white/30 transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={avatarUrl || undefined} alt={name} className="object-cover" />
              <AvatarFallback className="bg-white/20 text-lg font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-white">
              {name}
            </h2>
            <p className="text-sm text-white/70">{email}</p>
            {department && (
              <div className="mt-1">
                <DepartmentBadge department={department} size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Date and Time */}
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-sm font-medium text-white/90">{dateStr}</span>
          <span className="text-xs text-white/60">{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

