import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-secondary text-secondary-foreground",
  low: "bg-success text-success-foreground",
};

export function UrgencyBadge({ level }: { level: string }) {
  const key = level.toLowerCase();
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide", styles[key] || styles.medium)}>
      {level}
    </span>
  );
}
