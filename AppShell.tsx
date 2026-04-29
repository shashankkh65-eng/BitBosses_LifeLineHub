import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AppRole } from "@/lib/auth-helpers";

const roleLabel: Record<AppRole, string> = {
  donor: "Donor",
  organisation: "Organisation",
  savior: "Savior",
};

export function AppShell({ role, name, children }: { role: AppRole; name?: string | null; children: React.ReactNode }) {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">LifeLine Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-tight">{name || roleLabel[role]}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{roleLabel[role]} dashboard</div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
