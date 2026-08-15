import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser, normalizeQuery, SEARCH_CACHE_TTL_MS } from "./lib";

export const start = mutation({
  args: { query: v.string() },
  returns: v.id("productSearches"),
  handler: async (ctx, { query: rawQuery }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const trimmedQuery = rawQuery.trim();
    const normalizedQuery = normalizeQuery(trimmedQuery);

    // --- Cache check -----------------------------------------------------
    // Reuse the most recent completed report for this product query instead
    // of paying for a fresh shopping-API call + AI extraction. This is the
    // single biggest cost lever on this feature -- but note the TTL is much
    // shorter than the old surname cache (see lib.ts) since prices move.
    const cachedSearch = await ctx.db
      .query("productSearches")
      .withIndex("by_normalized_query", (q) =>
        q.eq("normalizedQuery", normalizedQuery),
      )
      .filter((q) => q.eq(q.field("status"), "complete"))
      .order("desc")
      .first();

    if (
      cachedSearch &&
      Date.now() - cachedSearch.createdAt < SEARCH_CACHE_TTL_MS
    ) {
      const cachedReport = await ctx.db
        .query("priceReports")
        .withIndex("by_search", (q) => q.eq("searchId", cachedSearch._id))
        .first();

      if (cachedReport) {
        // New history row for *this* user/search, but no external calls --
        // just a copy of the cached report attached to the new searchId.
        const searchId = await ctx.db.insert("productSearches", {
          userId: user._id,
          query: trimmedQuery,
          normalizedQuery,
          status: "complete",
          createdAt: Date.now(),
        });

        await ctx.db.insert("priceReports", {
          searchId,
          query: trimmedQuery,
          productName: cachedReport.productName,
          lowestPrice: cachedReport.lowestPrice,
          currency: cachedReport.currency,
          listings: cachedReport.listings,
          summary: cachedReport.summary,
          sources: cachedReport.sources,
          createdAt: Date.now(),
        });

        return searchId;
      }
    }

    // --- No usable cache entry: run the real pipeline ---------------------
    const searchId = await ctx.db.insert("productSearches", {
      userId: user._id,
      query: trimmedQuery,
      normalizedQuery,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.productActions.research, {
      searchId,
      query: trimmedQuery,
    });

    return searchId;
  },
});

export const getMine = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("productSearches"),
      _creationTime: v.float64(),
      query: v.string(),
      normalizedQuery: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("complete"),
        v.literal("failed"),
      ),
      createdAt: v.float64(),
    }),
  ),

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) return [];

    const searches = await ctx.db
      .query("productSearches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    return searches.map((search) => ({
      _id: search._id,
      _creationTime: search._creationTime,
      query: search.query,
      normalizedQuery: search.normalizedQuery,
      status: search.status,
      createdAt: search.createdAt,
    }));
  },
});

export const getReport = query({
  args: { searchId: v.id("productSearches") },
  handler: async (ctx, { searchId }) => {
    return await ctx.db
      .query("priceReports")
      .withIndex("by_search", (q) => q.eq("searchId", searchId))
      .first();
  },
});

// convex/productSearches.ts --- add this export alongside start/getMine/getReport
export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("productSearches"),
      _creationTime: v.float64(),
      query: v.string(),
      normalizedQuery: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("complete"),
        v.literal("failed"),
      ),
      createdAt: v.float64(),
    }),
  ),

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) return [];

    const searches = await ctx.db
      .query("productSearches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);

    return searches.map((search) => ({
      _id: search._id,
      _creationTime: search._creationTime,
      query: search.query,
      normalizedQuery: search.normalizedQuery,
      status: search.status,
      createdAt: search.createdAt,
    }));
  },
});

// Internal-only helper used by productActions.research as a race guard:
// if another request for the same normalized query completed while this
// one was queued, reuse it instead of hitting the shopping API + AI again.
export const findCompletedForNormalizedQuery = internalQuery({
  args: {
    normalizedQuery: v.string(),
    excludeSearchId: v.id("productSearches"),
  },
  handler: async (ctx, { normalizedQuery, excludeSearchId }) => {
    const candidate = await ctx.db
      .query("productSearches")
      .withIndex("by_normalized_query", (q) =>
        q.eq("normalizedQuery", normalizedQuery),
      )
      .filter((q) => q.eq(q.field("status"), "complete"))
      .order("desc")
      .first();

    if (!candidate || candidate._id === excludeSearchId) return null;
    return candidate;
  },
});

export const getPublicReport = query({
  args: { searchId: v.id("productSearches") },
  handler: async (ctx, { searchId }) => {
    const search = await ctx.db.get(searchId);
    if (!search || search.status !== "complete") return null;

    const report = await ctx.db
      .query("priceReports")
      .withIndex("by_search", (q) => q.eq("searchId", searchId))
      .first();

    if (!report) return null;

    return {
      query: report.query,
      productName: report.productName,
      lowestPrice: report.lowestPrice,
      currency: report.currency,
      listings: report.listings ?? [],
      summary: report.summary,
      sources: report.sources,
      createdAt: report.createdAt,
    };
  },
});
