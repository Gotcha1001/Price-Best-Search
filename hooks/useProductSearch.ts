// hooks/useProductSearch.ts
"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useProductSearch() {
  const start = useMutation(api.productSearches.start);
  const history = useQuery(api.productSearches.getMine);
  return { start, history };
}

export function useProductReport(searchId: Id<"productSearches"> | undefined) {
  return useQuery(
    api.productSearches.getReport,
    searchId ? { searchId } : "skip",
  );
}

export function useProductHistory() {
  return useQuery(api.productSearches.getAll);
}
