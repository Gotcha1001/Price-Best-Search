// convex/auth.config.ts
const authConfig = {
  providers: [
    {
      domain: "https://tough-deer-5265.clerk.accounts.dev",
      applicationID: "convex", // ← must be "convex", not a dynamic env var
    },
  ],
};

export default authConfig;
