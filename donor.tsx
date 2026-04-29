import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { RequestCard, type RequestRow } from "@/components/app/RequestCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CATEGORIES, URGENCIES } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/donor")({
  head: () => ({ meta: [{ title: "Donor dashboard — LifeLine Hub" }] }),
  component: DonorPage,
});

function DonorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [orgs, setOrgs] = useState<Record<string, string>>({});
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterUrg, setFilterUrg] = useState<string>("all");
  const [accepting, setAccepting] = useState<RequestRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: reqs }, { data: orgList }] = await Promise.all([
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
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
      if (roleRow?.role !== "donor") { navigate({ to: "/" }); return; }
      setUserId(session.user.id);
      setName(session.user.email?.split("@")[0] ?? "Donor");
      await load();
      setLoading(false);
    })();
    const ch = supabase.channel("donor-requests").on("postgres_changes", { event: "*", schema: "public", table: "requests" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [navigate]);

  const filtered = useMemo(() => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return requests
      .filter((r) => filterCat === "all" || r.category === filterCat)
      .filter((r) => filterUrg === "all" || r.urgency === filterUrg)
      .sort((a, b) => (order[a.urgency] - order[b.urgency]) || (b.created_at.localeCompare(a.created_at)));
  }, [requests, filterCat, filterUrg]);

  const accept = async () => {
    if (!accepting || !userId) return;
    setBusy(true);
    const { error } = await supabase.from("requests").update({
      status: "accepted", accepted_by: userId, donor_note: note || null,
    }).eq("id", accepting.id).eq("status", "open");
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request accepted!");
    setAccepting(null); setNote(""); await load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const myAccepted = requests.filter(r => r.accepted_by === userId);

  return (
    <AppShell role="donor" name={name}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Open requests</h1>
        <p className="text-muted-foreground mt-1">Sorted by urgency. Accept a request to commit your help.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPills label="Category" value={filterCat} setValue={setFilterCat} options={["all", ...CATEGORIES]} />
        <FilterPills label="Urgency" value={filterUrg} setValue={setFilterUrg} options={["all", ...URGENCIES]} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <div className="text-muted-foreground text-sm col-span-full">No requests match your filters.</div>}
        {filtered.map((r) => (
          <RequestCard key={r.id} r={r} orgName={orgs[r.created_by]} footer={
            r.status === "open" ? (
              <Button className="w-full" onClick={() => setAccepting(r)}>Accept request</Button>
            ) : r.accepted_by === userId ? (
              <div className="text-xs text-success font-semibold">✓ You accepted this</div>
            ) : null
          } />
        ))}
      </section>

      {myAccepted.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-12 mb-4">Your contributions ({myAccepted.length})</h2>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myAccepted.map((r) => <RequestCard key={r.id} r={r} orgName={orgs[r.created_by]} />)}
          </section>
        </>
      )}

      <Dialog open={!!accepting} onOpenChange={(o) => !o && setAccepting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Accept “{accepting?.title}”</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Add a note about your contribution (e.g. “Providing 50 meals”).</div>
            <Label>Contribution details</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Providing 50 hot meals by tomorrow 10am" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccepting(null)}>Cancel</Button>
            <Button onClick={accept} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function FilterPills({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: readonly string[] }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-card px-2 py-1">
      <span className="text-xs text-muted-foreground px-1.5">{label}:</span>
      {options.map((o) => (
        <button key={o} onClick={() => setValue(o)} className={"text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide " + (value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
          {o}
        </button>
      ))}
    </div>
  );
}
