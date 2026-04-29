import { urgencyClasses, statusClasses } from "@/lib/auth-helpers";
import { MapPin, Tag, Package } from "lucide-react";

export type RequestRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  quantity: string | null;
  location: string;
  urgency: string;
  status: string;
  created_by: string;
  accepted_by: string | null;
  assigned_to: string | null;
  donor_note: string | null;
  proof: string | null;
  created_at: string;
};

export function RequestCard({ r, footer, orgName }: { r: RequestRow; footer?: React.ReactNode; orgName?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{r.title}</h3>
          {orgName && <div className="text-xs text-muted-foreground mt-0.5">by {orgName}</div>}
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide " + urgencyClasses(r.urgency)}>{r.urgency}</span>
          <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide " + statusClasses(r.status)}>{r.status}</span>
        </div>
      </div>
      {r.description && <p className="text-sm text-muted-foreground line-clamp-3">{r.description}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{r.category}</span>
        {r.quantity && <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" />{r.quantity}</span>}
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.location}</span>
      </div>
      {r.donor_note && <div className="text-xs rounded-md bg-secondary/50 px-3 py-2"><span className="font-semibold">Donor note:</span> {r.donor_note}</div>}
      {r.proof && <div className="text-xs rounded-md bg-success/10 px-3 py-2"><span className="font-semibold">Proof:</span> {r.proof}</div>}
      {footer && <div className="pt-1">{footer}</div>}
    </div>
  );
}
