"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProductHistory } from "@/hooks/useProductSearch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "@/app/components/PriceCard";

type StatusFilter = "all" | "pending" | "complete" | "failed";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "complete", label: "Complete" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function HistoryPage() {
  const router = useRouter();
  const history = useProductHistory();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    if (!history) return [];
    return history.filter((h) => {
      const matchesQuery = h.query
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || h.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [history, query, statusFilter]);

  const isLoading = history === undefined;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">My searches</h1>
        <p className="text-muted-foreground text-sm">
          Every product you&apos;ve looked up, in one place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by product..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={statusFilter === tab.value ? "default" : "outline"}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground pt-6 text-center text-sm">
            {history && history.length === 0
              ? "No searches yet — try a product from the dashboard to get your first price comparison."
              : "No searches match that filter."}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((h) => (
            <button
              key={h._id}
              onClick={() => router.push(`/dashboard/search?id=${h._id}`)}
              className="hover:bg-muted flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors text-left"
            >
              <span className="flex items-center gap-2 font-medium">
                <StatusIcon status={h.status} />
                {h.query}
              </span>
              <span className="text-muted-foreground text-xs">
                {new Date(h.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
