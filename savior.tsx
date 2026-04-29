import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { RequestCard, type RequestRow } from "@/components/app/RequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/savior")({
  head: () => ({ meta: [{ title: "Savior dashboard — LifeLine Hub" }] }),
  component: SaviorPage,
});

function SaviorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [orgs, setOrgs] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState<RequestRow | null>(null);
  const [proof, setProof] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: reqs }, { data: orgList }] = await Promise.all([
      supabase.from("requests").select("*").in("status", ["accepted", "assigned", "completed"]).order("created_at", { ascending: false }),
      supabase.from("organisation_profiles").select("id, name"),
    ]);
    setRequests((reqs ?? []) as RequestRow[]);
    setOrgs(Object.fromEntries((orgList ?? []).map((o) => [o.id, o.name])));
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (roleRow?.role !== "savior") { navigate({ to: "/" }); return; }
      const { data: prof } = await supabase.from("savior_profiles").select("full_name").eq("id", session.user.id).maybeSingle();
      setUserId(session.user.id);
      setName(prof?.full_name ?? "Savior");
      await load();
      setLoading(false);
    })();
    const ch = supabase.channel("savior-requests").on("postgres_changes", { event: "*", schema: "public", table: "requests" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [navigate]);

  const takeDelivery = async (r: RequestRow) => {
    if (!userId) return;
    const { error } = await supabase.from("requests").update({
      status: "assigned", assigned_to: userId,
    }).eq("id", r.id).eq("status", "accepted");
    if (error) { toast.error(error.message); return; }
    toast.success("You took this delivery");
    await load();
  };

  const complete = async () => {
    if (!completing || !userId) return;
    if (!proof.trim()) { toast.error("Add proof (image URL or note)"); return; }
    setBusy(true);
    const { error } = await supabase.from("requests").update({
      status: "completed", proof: proof.trim(),
    }).eq("id", completing.id).eq("assigned_to", userId).eq("status", "assigned");
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as delivered!");
    setCompleting(null); setProof(""); await load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const available = requests.filter((r) => r.status === "accepted");
  const mine = requests.filter((r) => r.assigned_to === userId);

  return (
    <AppShell role="savior" name={name}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Available deliveries</h1>
        <p className="text-muted-foreground mt-1">Donor-committed requests waiting for someone to deliver.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {available.length === 0 && <div className="text-muted-foreground text-sm col-span-full">No deliveries available right now.</div>}
        {available.map((r) => (
          <RequestCard key={r.id} r={r} orgName={orgs[r.created_by]} footer={
            <Button className="w-full" onClick={() => takeDelivery(r)}>Take delivery</Button>
          } />
        ))}
      </section>

      <h2 className="text-2xl font-bold mt-12 mb-4">Your deliveries ({mine.length})</h2>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mine.length === 0 && <div className="text-muted-foreground text-sm col-span-full">You haven't taken any deliveries yet.</div>}
        {mine.map((r) => (
          <RequestCard key={r.id} r={r} orgName={orgs[r.created_by]} footer={
            r.status === "assigned" ? (
              <Button className="w-full" variant="default" onClick={() => setCompleting(r)}>Mark as delivered</Button>
            ) : <div className="text-xs text-success font-semibold">✓ Completed</div>
          } />
        ))}
      </section>

      <Dialog open={!!completing} onOpenChange={(o) => !o && setCompleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm delivery</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Provide proof — an image URL, receipt link, or short note.</div>
            <Label>Proof</Label>
            <Input value={proof} onChange={(e) => setProof(e.target.value)} placeholder="https://imgur.com/… or 'Handed 50 meals at NGO gate'" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompleting(null)}>Cancel</Button>
            <Button onClick={complete} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
