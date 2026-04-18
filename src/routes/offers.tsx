import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Gift, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadState } from "@/lib/banking/storage";
import { getOffersFor, type Offer } from "@/lib/banking/offers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Promotions — Lunar Bank" },
      { name: "description", content: "Personalized offers picked for you based on your spending and preferences." },
    ],
  }),
  component: OffersPage,
});

const CATEGORY_STYLES: Record<Offer["category"], string> = {
  travel: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  dining: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  shopping: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  tech: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  wellness: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  finance: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const state = loadState();
    setOffers(getOffersFor(state.profile));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="h-4 w-4" /> Offers & Promotions
          </div>
          <div className="w-32" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <section
          className="mb-8 overflow-hidden rounded-2xl p-8 text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Sparkles className="h-4 w-4" /> Curated for you
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Personalized offers</h1>
          <p className="mt-2 max-w-xl text-sm opacity-90">
            We only show offers we think you'll actually use — based on your widgets, spending categories, and lifestyle.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <article
              key={o.id}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", CATEGORY_STYLES[o.category])}>
                  {o.category}
                </span>
                {o.isNew && <Badge className="bg-primary/15 text-primary hover:bg-primary/20">New</Badge>}
              </div>
              <h3 className="text-base font-semibold leading-tight">{o.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{o.partner}</p>
              <p className="mt-3 text-sm text-foreground/80">{o.description}</p>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-primary">{o.discount}</span>
                <span className="ml-auto text-muted-foreground">Ends {o.expires}</span>
              </div>
              <p className="mt-3 text-[11px] italic text-muted-foreground">✨ {o.reason}</p>
              <Button className="mt-4 w-full" size="sm">Activate offer</Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
