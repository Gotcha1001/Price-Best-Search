import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  productSearches: defineTable({
    userId: v.id("users"),
    query: v.string(),
    // Lowercased/trimmed copy of `query`, used purely for cache lookups
    // so "iPhone 16", "iphone 16 ", and "IPHONE 16" all share one cached report.
    normalizedQuery: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_query", ["query"])
    // Powers the caching lookup in productSearches.start and the
    // race-guard re-check in productActions.research.
    .index("by_normalized_query", ["normalizedQuery"]),

  // The generated price-comparison report + raw retailer listings for a search
  priceReports: defineTable({
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
    sources: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_search", ["searchId"]),
});
