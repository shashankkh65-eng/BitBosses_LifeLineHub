import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, HandHeart, Building2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life-Line Hub — Connect Donors, Organisations & Saviors" },
      { name: "description", content: "A trusted social impact platform connecting donors with organisations and people in need." },
      { property: "og:title", content: "Life-Line Hub" },
      { property: "og:description", content: "Connect Donors, Organisations & Saviors for real social impact." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <header className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Life-Line Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/signup"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-12 pb-20 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> A new kind of giving platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ backgroundImage: "var(--gradient-hero)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Be someone&apos;s lifeline today.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Life-Line Hub connects compassionate donors with verified organisations and people in
          urgent need — food, healthcare, blood, disaster relief, and more.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup"><Button size="lg" className="shadow-[var(--shadow-elegant)]">Become a Donor</Button></Link>
          <Link to="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24 grid gap-6 md:grid-cols-3">
        {[
          { icon: HandHeart, title: "Donors", desc: "Browse open requests sorted by urgency and commit your help.", live: true },
          { icon: Building2, title: "Organisations", desc: "Post needs, see who is helping, and track delivery in real time.", live: true },
          { icon: Heart, title: "Saviors", desc: "Pick up donor-committed requests and deliver them on the ground.", live: true },
        ].map(({ icon: Icon, title, desc, live }) => (
          <div key={title} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {live && <span className="text-[10px] uppercase tracking-wider rounded-full bg-success/15 text-success px-2 py-0.5 font-bold">Live</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
