// // convex/lib.ts --- small shared helpers, no queries/mutations/actions here.
// // Pure/isomorphic code only (safe to import from both node and non-node
// // Convex files) so this file intentionally has no "use node" directive.

// import type { QueryCtx, MutationCtx } from "./_generated/server";

// // How long a completed report stays eligible for cache reuse before we
// // consider it stale and re-scrape. Mostly a cost lever -- raise it if
// // shopping-API spend is the bigger concern, lower it if price freshness
// // matters more (prices move faster than surname history ever did).
// export const SEARCH_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// export function normalizeQuery(query: string): string {
//   return query.trim().toLowerCase();
// }

// // Shared identity -> users-table lookup. Returns null if signed out or if
// // the Clerk identity has no matching row yet (rather than throwing), so
// // queries can early-return [] and mutations can decide how strict to be.
// export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
//   const identity = await ctx.auth.getUserIdentity();
//   if (!identity) return null;

//   return await ctx.db
//     .query("users")
//     .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//     .first();
// }

// convex/lib.ts -- small shared helpers, no queries/mutations/actions here.
// Pure/isomorphic code only (safe to import from both node and non-node
// Convex files) so this file intentionally has no "use node" directive.

import type { QueryCtx, MutationCtx } from "./_generated/server";

// How long a completed report stays eligible for cache reuse before we
// consider it stale and re-scrape. Mostly a cost lever -- raise it if
// shopping-API spend is the bigger concern, lower it if price freshness
// matters more (prices move faster than surname history ever did).
export const SEARCH_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Countries we support for localized shopping results. `code` is passed
// straight through to SerpApi's `gl` param (Google's "country to shop
// from" parameter), so it must match Google's two-letter country codes.
export const COUNTRIES: { code: string; label: string; currency: string }[] = [
  { code: "za", label: "South Africa", currency: "ZAR" },
  { code: "us", label: "United States", currency: "USD" },
  { code: "gb", label: "United Kingdom", currency: "GBP" },
  { code: "au", label: "Australia", currency: "AUD" },
  { code: "de", label: "Germany", currency: "EUR" },
  { code: "ca", label: "Canada", currency: "CAD" },
];

export const DEFAULT_COUNTRY = "za";

export function isValidCountry(code: string): boolean {
  return COUNTRIES.some((c) => c.code === code);
}

// Cache key now includes the country -- the same product query needs a
// separate cached report per region, since retailers, listings, and
// currency all differ (e.g. "iPhone 16" in za surfaces Takealot/Incredible
// Connection in ZAR, "iPhone 16" in us surfaces Best Buy/Amazon in USD).
export function normalizeQuery(query: string, country: string): string {
  return `${country}:${query.trim().toLowerCase()}`;
}

// Shared identity -> users-table lookup. Returns null if signed out or if
// the Clerk identity has no matching row yet (rather than throwing), so
// queries can early-return [] and mutations can decide how strict to be.
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}
