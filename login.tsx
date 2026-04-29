import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathForRole, type AppRole } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — LifeLine Hub" }, { name: "description", content: "Log in to LifeLine Hub." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) { toast.error("Enter email and password (min 8 chars)"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) { setLoading(false); toast.error("Invalid credentials"); return; }
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).maybeSingle();
    setLoading(false);
    if (!roleRow) { toast.error("No role assigned"); return; }
    toast.success("Welcome back!");
    navigate({ to: dashboardPathForRole(roleRow.role as AppRole) });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "var(--gradient-soft)" }}>
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2"><Heart className="h-6 w-6" /><span className="text-lg font-bold">LifeLine Hub</span></Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Welcome back, changemaker.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">Pick up where you left off and continue making an impact.</p>
        </div>
        <div className="text-sm opacity-80">© LifeLine Hub</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use the email and password you signed up with.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
