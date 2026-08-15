import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const saveReport = internalMutation({
  args: {
    searchId: v.id("productSearches"),
    query: v.string(),
    productName: v.optional(v.string()),
    lowestPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    listings: v.array(
      v.object({
        retailer: v.string(),
        price: v.number(),
        url: v.string(),
        inStock: v.optional(v.boolean()),
      }),
    ),
    summary: v.string(),
    sources: v.array(v.object({ title: v.string(), url: v.string() })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("priceReports", { ...args, createdAt: Date.now() });
    await ctx.db.patch(args.searchId, { status: "complete" });
  },
});

export const markFailed = internalMutation({
  args: { searchId: v.id("productSearches") },
  handler: async (ctx, { searchId }) => {
    await ctx.db.patch(searchId, { status: "failed" });
  },
});

// Used by productActions.research's race-guard: copies an already-completed
// report onto a different searchId instead of re-running the shopping API + AI call.
export const copyReport = internalMutation({
  args: {
    fromSearchId: v.id("productSearches"),
    toSearchId: v.id("productSearches"),
    query: v.string(),
  },
  handler: async (ctx, { fromSearchId, toSearchId, query }) => {
    const sourceReport = await ctx.db
      .query("priceReports")
      .withIndex("by_search", (q) => q.eq("searchId", fromSearchId))
      .first();

    if (!sourceReport) {
      await ctx.db.patch(toSearchId, { status: "failed" });
      return;
    }

    await ctx.db.insert("priceReports", {
      searchId: toSearchId,
      query,
      productName: sourceReport.productName,
      lowestPrice: sourceReport.lowestPrice,
      currency: sourceReport.currency,
      listings: sourceReport.listings,
      summary: sourceReport.summary,
      sources: sourceReport.sources,
      createdAt: Date.now(),
    });
    await ctx.db.patch(toSearchId, { status: "complete" });
  },
});
