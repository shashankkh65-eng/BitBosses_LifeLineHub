import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { RequestCard, type RequestRow } from "@/components/app/RequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, URGENCIES } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { Loader2, Plus, User, Truck } from "lucide-react";

export const Route = createFileRoute("/organisation")({
  head: () => ({ meta: [{ title: "Organisation dashboard — LifeLine Hub" }] }),
  component: OrgPage,
});

type Profile = { id: string; name: string; location: string };
type DonorMini = { id: string; email: string };
type SaviorMini = { id: string; full_name: string; phone: string };

function OrgPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [saviors, setSaviors] = useState<Record<string, SaviorMini>>({});
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "food", description: "", quantity: "",
    location: "", urgency: "medium",
  });

  const load = async (orgId: string) => {
    const [{ data: reqs }, { data: sv }] = await Promise.all([
      supabase.from("requests").select("*").eq("created_by", orgId).order("created_at", { ascending: false }),
      supabase.from("savior_profiles").select("id, full_name, phone"),
    ]);
    setRequests((reqs ?? []) as RequestRow[]);
    setSaviors(Object.fromEntries((sv ?? []).map((s) => [s.id, s as SaviorMini])));
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (roleRow?.role !== "organisation") { navigate({ to: "/" }); return; }
      const { data: prof } = await supabase.from("organisation_profiles").select("id, name, location").eq("id", session.user.id).maybeSingle();
      setProfile(prof as Profile);
      if (prof) await load(prof.id);
      setLoading(false);
    })();
  }, [navigate]);

  const create = async () => {
    if (!profile) return;
    if (!form.title.trim() || !form.location.trim()) { toast.error("Title and location required"); return; }
    setBusy(true);
    const { error } = await supabase.from("requests").insert({
      title: form.title.trim(),
      category: form.category,
      description: form.description || null,
      quantity: form.quantity || null,
      location: form.location.trim(),
      urgency: form.urgency,
      created_by: profile.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request posted");
    setOpen(false);
    setForm({ title: "", category: "food", description: "", quantity: "", location: profile.location, urgency: "medium" });
    await load(profile.id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <AppShell role="organisation" name={profile?.name}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your help requests</h1>
          <p className="text-muted-foreground mt-1">Post needs and track who is helping.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && profile) setForm((f) => ({ ...f, location: f.location || profile.location })); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post a new request</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Need 100 cooked meals" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Urgency">
                  <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                    {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity"><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="100 meals" /></Field>
                <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mumbai" /></Field>
              </div>
              <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.length === 0 && <div className="text-muted-foreground text-sm col-span-full">No requests yet — click “New request” to post your first one.</div>}
        {requests.map((r) => (
          <RequestCard key={r.id} r={r} footer={
            <div className="text-xs space-y-1">
              {r.accepted_by && <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> Donor committed</div>}
              {r.assigned_to && (
                <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-warning-foreground" />
                  Savior: {saviors[r.assigned_to]?.full_name ?? "—"} {saviors[r.assigned_to]?.phone && `· ${saviors[r.assigned_to].phone}`}
                </div>
              )}
              {r.status === "completed" && <div className="text-success font-semibold">✓ Delivered</div>}
            </div>
          } />
        ))}
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
