// "use node";

// import { v } from "convex/values";
// import { internalAction } from "./_generated/server";
// import { internal } from "./_generated/api";
// import { normalizeQuery } from "./lib";

// interface SerpApiShoppingResult {
//   title: string;
//   source?: string; // retailer name
//   price?: string; // e.g. "$799.00"
//   extracted_price?: number;
//   link?: string;
//   product_link?: string;
//   delivery?: string;
// }

// interface SerpApiShoppingResponse {
//   shopping_results?: SerpApiShoppingResult[];
//   search_metadata?: { status?: string };
//   error?: string;
// }

// interface ProductListing {
//   retailer: string;
//   price: number;
//   url: string;
//   inStock?: boolean;
// }

// const CURRENCY_SYMBOL_MAP: Record<string, string> = {
//   $: "USD",
//   "€": "EUR",
//   "£": "GBP",
//   "¥": "JPY",
//   R: "ZAR",
// };

// function parsePrice(result: SerpApiShoppingResult): {
//   price: number | null;
//   currency: string;
// } {
//   if (typeof result.extracted_price === "number") {
//     const symbol = result.price?.trim().charAt(0) ?? "$";
//     return {
//       price: result.extracted_price,
//       currency: CURRENCY_SYMBOL_MAP[symbol] ?? "USD",
//     };
//   }
//   if (result.price) {
//     const match = result.price.match(/[\d,]+\.?\d*/);
//     const symbol = result.price.trim().charAt(0);
//     if (match) {
//       return {
//         price: parseFloat(match[0].replace(/,/g, "")),
//         currency: CURRENCY_SYMBOL_MAP[symbol] ?? "USD",
//       };
//     }
//   }
//   return { price: null, currency: "USD" };
// }

// export const research = internalAction({
//   args: { searchId: v.id("productSearches"), query: v.string() },
//   handler: async (ctx, { searchId, query: productQuery }) => {
//     try {
//       // --- Race guard --------------------------------------------------
//       // The cache check in productSearches.start happens at insert time.
//       // If two requests for the same query land close enough together,
//       // both can miss the cache and both schedule this action. Re-check
//       // right before spending money: if another in-flight/just-finished
//       // search for the same normalized query already completed, copy
//       // its report instead of hitting SerpApi again.
//       const normalizedQuery = normalizeQuery(productQuery);
//       const existingCompleted = await ctx.runQuery(
//         internal.productSearches.findCompletedForNormalizedQuery,
//         { normalizedQuery, excludeSearchId: searchId },
//       );

//       if (existingCompleted) {
//         await ctx.runMutation(internal.productMutations.copyReport, {
//           fromSearchId: existingCompleted._id,
//           toSearchId: searchId,
//           query: productQuery,
//         });
//         return;
//       }

//       const serpApiKey = process.env.SERPAPI_API_KEY;
//       if (!serpApiKey) {
//         console.error("[productActions] SERPAPI_API_KEY missing");
//         await ctx.runMutation(internal.productMutations.markFailed, {
//           searchId,
//         });
//         return;
//       }

//       const params = new URLSearchParams({
//         engine: "google_shopping",
//         q: productQuery,
//         api_key: serpApiKey,
//         gl: "us", // country to shop from; swap or make configurable per user
//         hl: "en",
//       });

//       const serpRes = await fetch(`https://serpapi.com/search.json?${params}`);

//       if (!serpRes.ok) {
//         console.error(
//           "[productActions] SerpApi HTTP error",
//           serpRes.status,
//           await serpRes.text(),
//         );
//         await ctx.runMutation(internal.productMutations.markFailed, {
//           searchId,
//         });
//         return;
//       }

//       const data = (await serpRes.json()) as SerpApiShoppingResponse;

//       if (data.error) {
//         console.error("[productActions] SerpApi error", data.error);
//         await ctx.runMutation(internal.productMutations.markFailed, {
//           searchId,
//         });
//         return;
//       }

//       const rawResults = data.shopping_results ?? [];
//       if (rawResults.length === 0) {
//         await ctx.runMutation(internal.productMutations.markFailed, {
//           searchId,
//         });
//         return;
//       }

//       let currency = "USD";
//       const listings: ProductListing[] = [];

//       for (const r of rawResults) {
//         const url = r.product_link ?? r.link;
//         if (!r.source || !url) continue;

//         const { price, currency: parsedCurrency } = parsePrice(r);
//         if (price === null) continue;

//         currency = parsedCurrency;
//         listings.push({
//           retailer: r.source,
//           price,
//           url,
//           inStock: r.delivery ? !/out of stock/i.test(r.delivery) : undefined,
//         });
//       }

//       if (listings.length === 0) {
//         await ctx.runMutation(internal.productMutations.markFailed, {
//           searchId,
//         });
//         return;
//       }

//       const sorted = [...listings].sort((a, b) => a.price - b.price);
//       const lowestPrice = sorted[0].price;
//       const highestPrice = sorted[sorted.length - 1].price;
//       const spread = highestPrice - lowestPrice;

//       const summary =
//         listings.length === 1
//           ? `Found one listing for "${productQuery}" at ${sorted[0].retailer}.`
//           : `Found ${listings.length} listings for "${productQuery}" across ${new Set(listings.map((l) => l.retailer)).size} retailers, ranging from ${lowestPrice.toFixed(2)} to ${highestPrice.toFixed(2)} ${currency}. Cheapest is ${sorted[0].retailer}${spread > 0 ? `, saving ${spread.toFixed(2)} ${currency} versus the priciest listing` : ""}.`;

//       const productName = rawResults[0]?.title;

//       await ctx.runMutation(internal.productMutations.saveReport, {
//         searchId,
//         query: productQuery,
//         productName,
//         lowestPrice,
//         currency,
//         listings,
//         summary,
//         sources: [], // SerpApi returns structured data directly, no page citations needed
//       });
//     } catch (e) {
//       console.error("[productActions] Unhandled error", e);
//       await ctx.runMutation(internal.productMutations.markFailed, { searchId });
//     }
//   },
// });
"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeQuery } from "./lib";

interface SerpApiShoppingResult {
  title: string;
  source?: string; // retailer name
  price?: string; // e.g. "$799.00" or "R14,999"
  extracted_price?: number;
  link?: string;
  product_link?: string;
  delivery?: string;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingResult[];
  search_metadata?: { status?: string };
  error?: string;
}

interface ProductListing {
  retailer: string;
  price: number;
  url: string;
  inStock?: boolean;
}

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  R: "ZAR",
};

function parsePrice(result: SerpApiShoppingResult): {
  price: number | null;
  currency: string;
} {
  if (typeof result.extracted_price === "number") {
    const symbol = result.price?.trim().charAt(0) ?? "$";
    return {
      price: result.extracted_price,
      currency: CURRENCY_SYMBOL_MAP[symbol] ?? "USD",
    };
  }
  if (result.price) {
    const match = result.price.match(/[\d,]+\.?\d*/);
    const symbol = result.price.trim().charAt(0);
    if (match) {
      return {
        price: parseFloat(match[0].replace(/,/g, "")),
        currency: CURRENCY_SYMBOL_MAP[symbol] ?? "USD",
      };
    }
  }
  return { price: null, currency: "USD" };
}

export const research = internalAction({
  args: {
    searchId: v.id("productSearches"),
    query: v.string(),
    country: v.string(),
  },
  handler: async (ctx, { searchId, query: productQuery, country }) => {
    try {
      // --- Race guard ----------------------------------------------------
      // The cache check in productSearches.start happens at insert time.
      // If two requests for the same query+country land close enough
      // together, both can miss the cache and both schedule this action.
      // Re-check right before spending money: if another in-flight/just-
      // finished search for the same normalized query already completed,
      // copy its report instead of hitting SerpApi again.
      const normalizedQuery = normalizeQuery(productQuery, country);
      const existingCompleted = await ctx.runQuery(
        internal.productSearches.findCompletedForNormalizedQuery,
        { normalizedQuery, excludeSearchId: searchId },
      );

      if (existingCompleted) {
        await ctx.runMutation(internal.productMutations.copyReport, {
          fromSearchId: existingCompleted._id,
          toSearchId: searchId,
          query: productQuery,
        });
        return;
      }

      const serpApiKey = process.env.SERPAPI_API_KEY;
      if (!serpApiKey) {
        console.error("[productActions] SERPAPI_API_KEY missing");
        await ctx.runMutation(internal.productMutations.markFailed, {
          searchId,
        });
        return;
      }

      // `gl` is SerpApi/Google's "country to shop from" param -- this is
      // what actually determines which retailers show up (e.g. gl=za
      // surfaces Takealot, Makro, Incredible Connection; gl=us surfaces
      // Best Buy, Amazon, Walmart) and what currency prices come back in.
      const params = new URLSearchParams({
        engine: "google_shopping",
        q: productQuery,
        api_key: serpApiKey,
        gl: country,
        hl: "en",
      });

      const serpRes = await fetch(`https://serpapi.com/search.json?${params}`);
      if (!serpRes.ok) {
        console.error(
          "[productActions] SerpApi HTTP error",
          serpRes.status,
          await serpRes.text(),
        );
        await ctx.runMutation(internal.productMutations.markFailed, {
          searchId,
        });
        return;
      }

      const data = (await serpRes.json()) as SerpApiShoppingResponse;
      if (data.error) {
        console.error("[productActions] SerpApi error", data.error);
        await ctx.runMutation(internal.productMutations.markFailed, {
          searchId,
        });
        return;
      }

      const rawResults = data.shopping_results ?? [];
      if (rawResults.length === 0) {
        await ctx.runMutation(internal.productMutations.markFailed, {
          searchId,
        });
        return;
      }

      let currency = "USD";
      const listings: ProductListing[] = [];

      for (const r of rawResults) {
        const url = r.product_link ?? r.link;
        if (!r.source || !url) continue;
        const { price, currency: parsedCurrency } = parsePrice(r);
        if (price === null) continue;
        currency = parsedCurrency;
        listings.push({
          retailer: r.source,
          price,
          url,
          inStock: r.delivery ? !/out of stock/i.test(r.delivery) : undefined,
        });
      }

      if (listings.length === 0) {
        await ctx.runMutation(internal.productMutations.markFailed, {
          searchId,
        });
        return;
      }

      const sorted = [...listings].sort((a, b) => a.price - b.price);
      const lowestPrice = sorted[0].price;
      const highestPrice = sorted[sorted.length - 1].price;
      const spread = highestPrice - lowestPrice;

      const summary =
        listings.length === 1
          ? `Found one listing for "${productQuery}" at ${sorted[0].retailer}.`
          : `Found ${listings.length} listings for "${productQuery}" across ${
              new Set(listings.map((l) => l.retailer)).size
            } retailers, ranging from ${lowestPrice.toFixed(2)} to ${highestPrice.toFixed(
              2,
            )} ${currency}. Cheapest is ${sorted[0].retailer}${
              spread > 0
                ? `, saving ${spread.toFixed(2)} ${currency} versus the priciest listing`
                : ""
            }.`;

      const productName = rawResults[0]?.title;

      await ctx.runMutation(internal.productMutations.saveReport, {
        searchId,
        query: productQuery,
        productName,
        lowestPrice,
        currency,
        listings,
        summary,
        sources: [], // SerpApi returns structured data directly, no page citations needed
      });
    } catch (e) {
      console.error("[productActions] Unhandled error", e);
      await ctx.runMutation(internal.productMutations.markFailed, { searchId });
    }
  },
});
