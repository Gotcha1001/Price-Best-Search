"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

import { useProductSearch, useProductReport } from "@/hooks/useProductSearch";
import type { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceCard, FailedCard, StatusIcon } from "@/app/components/PriceCard";
import { SearchingModal } from "@/app/components/SearchingModal";

export default function ProductSearchPage() {
  return (
    <Suspense fallback={null}>
      <ProductSearchPageInner />
    </Suspense>
  );
}

function ProductSearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<Id<"productSearches"> | undefined>(
    (idParam as Id<"productSearches"> | null) ?? undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  const { start, history } = useProductSearch();
  const report = useProductReport(activeId);

  const activeSearch = useMemo(
    () => history?.find((h) => h._id === activeId),
    [history, activeId],
  );

  const isPending = activeSearch?.status === "pending";
  const isFailed = activeSearch?.status === "failed";

  function selectSearch(id: Id<"productSearches">) {
    setActiveId(id);
    router.replace(`/dashboard/search?id=${id}`, { scroll: false });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const id = await start({ query: trimmed });
      selectSearch(id);
      setQuery("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Compare a product&apos;s price
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter a product to pull together listings and the lowest price across
          retailers from public sources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. iPhone 16, Dyson V15, PS5..."
            className="pl-9"
            disabled={submitting}
          />
        </div>
        <Button type="submit" disabled={submitting || !query.trim()}>
          {submitting ? "Starting..." : "Search"}
        </Button>
      </form>

      {/* Fancy searching modal while pending */}
      <SearchingModal open={!!isPending} query={activeSearch?.query} />

      <AnimatePresence mode="wait">
        {activeId && !isPending && (
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {isFailed && <FailedCard query={activeSearch?.query} />}
            {report && (
              <PriceCard
                query={activeSearch?.query ?? report.query}
                productName={report.productName}
                lowestPrice={report.lowestPrice}
                currency={report.currency}
                listings={report.listings ?? []}
                summary={report.summary}
                sources={report.sources}
                searchId={activeId}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {history && history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            Recent searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h._id}
                onClick={() => selectSearch(h._id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  h._id === activeId
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted"
                }`}
              >
                <StatusIcon status={h.status} />
                {h.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
