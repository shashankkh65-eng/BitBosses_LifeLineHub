import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathForRole, type AppRole } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, Loader2, HandHeart, Building2, Truck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — LifeLine Hub" }, { name: "description", content: "Create a Donor, Organisation or Savior account on LifeLine Hub." }] }),
  component: SignupPage,
});

const baseSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(7).max(20),
  location: z.string().trim().min(2).max(120),
});

const roleConfig: { value: AppRole; label: string; icon: React.ComponentType<{ className?: string }>; tagline: string }[] = [
  { value: "donor", label: "Donor", icon: HandHeart, tagline: "I want to give help" },
  { value: "organisation", label: "Organisation", icon: Building2, tagline: "We need help for our cause" },
  { value: "savior", label: "Savior", icon: Truck, tagline: "I'll deliver help" },
];

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", org_name: "", email: "", password: "",
    phone: "", location: "", description: "", vehicle: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    const parsed = baseSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (role === "organisation" && !form.org_name.trim()) { toast.error("Organisation name required"); return; }
    if (role !== "organisation" && !form.full_name.trim()) { toast.error("Full name required"); return; }

    setLoading(true);
    const meta: Record<string, string> = { role, phone: form.phone, location: form.location };
    if (role === "organisation") {
      meta.name = form.org_name; meta.contact_email = form.email; meta.description = form.description;
    } else {
      meta.full_name = form.full_name;
      if (role === "savior") meta.vehicle = form.vehicle;
    }
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { emailRedirectTo: `${window.location.origin}${dashboardPathForRole(role)}`, data: meta },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created! Logging you in…");
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (signInErr) { navigate({ to: "/login" }); return; }
    navigate({ to: dashboardPathForRole(role) });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "var(--gradient-soft)" }}>
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2"><Heart className="h-6 w-6" /><span className="text-lg font-bold">LifeLine Hub</span></Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Three roles. One mission.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">Donors give. Organisations request. Saviors deliver. Together, every life matters.</p>
        </div>
        <div className="text-sm opacity-80">© LifeLine Hub</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-[var(--shadow-elegant)]">
          {!role ? (
            <>
              <h1 className="text-2xl font-bold">Choose your role</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can only pick one — it determines your dashboard.</p>
              <div className="mt-6 space-y-3">
                {roleConfig.map(({ value, label, icon: Icon, tagline }) => (
                  <button key={value} onClick={() => setRole(value)} className="w-full flex items-center gap-4 rounded-xl border p-4 text-left hover:border-primary hover:bg-primary/5 transition">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs text-muted-foreground">{tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-muted-foreground">Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></p>
            </>
          ) : (
            <>
              <button onClick={() => setRole(null)} className="text-xs text-muted-foreground hover:text-foreground">← change role</button>
              <h1 className="text-2xl font-bold mt-2">Sign up as {roleConfig.find(r => r.value === role)!.label}</h1>
              <form onSubmit={submit} className="mt-5 space-y-3">
                {role === "organisation" ? (
                  <Field label="Organisation name"><Input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} placeholder="Hope Foundation" /></Field>
                ) : (
                  <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Asha Patel" /></Field>
                )}
                <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field>
                <Field label="Password"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" /></Field>
                  <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mumbai" /></Field>
                </div>
                {role === "organisation" && (
                  <Field label="About (optional)"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What does your organisation do?" /></Field>
                )}
                {role === "savior" && (
                  <Field label="Vehicle (optional)"><Input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Bike / Car / Van" /></Field>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
