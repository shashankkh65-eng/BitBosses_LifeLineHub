import { supabase } from "@/integrations/supabase/client";

export type AppRole = "donor" | "organisation" | "savior";

export async function getCurrentUserAndRole(): Promise<{ userId: string; role: AppRole } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
  if (!data) return null;
  return { userId: session.user.id, role: data.role as AppRole };
}

export function dashboardPathForRole(role: AppRole): "/donor" | "/organisation" | "/savior" {
  if (role === "organisation") return "/organisation";
  if (role === "savior") return "/savior";
  return "/donor";
}

export function urgencyClasses(level: string): string {
  const l = level.toLowerCase();
  if (l === "high") return "bg-destructive text-destructive-foreground";
  if (l === "medium") return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export function statusClasses(status: string): string {
  switch (status) {
    case "open": return "bg-secondary text-secondary-foreground";
    case "accepted": return "bg-primary/15 text-primary";
    case "assigned": return "bg-warning/20 text-warning-foreground";
    case "completed": return "bg-success/15 text-success";
    default: return "bg-muted";
  }
}

export const CATEGORIES = ["food", "money", "healthcare", "clothing", "other"] as const;
export const URGENCIES = ["low", "medium", "high"] as const;
