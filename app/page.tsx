"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search, ScrollText, Clock, Globe2, Tag } from "lucide-react";

const FEATURES = [
  {
    title: "Instant price lookup",
    description:
      "Type a product name, get every retailer's price synthesized from public sources in seconds.",
    icon: Search,
  },
  {
    title: "Lowest price, flagged",
    description:
      "See the single cheapest listing highlighted, with a direct link.",
    icon: Tag,
  },
  {
    title: "Every retailer compared",
    description:
      "Understand where a product is cheapest right now, sorted low to high.",
    icon: Globe2,
  },
  {
    title: "Search history",
    description:
      "Revisit every price comparison you've generated, saved to your account.",
    icon: Clock,
  },
];

const SAMPLE_QUERIES = [
  "iPhone 16",
  "Dyson V15",
  "PS5",
  "Nespresso Vertuo",
  "Herman Miller Aeron",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12 * i,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.prefetch("/dashboard");
  }, [isSignedIn, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50/80 to-white px-6 text-center dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[-20%] top-[-15%] h-[520px] w-[520px] rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/25"
          animate={{ scale: [1, 1.18, 1], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-15%] h-[580px] w-[580px] rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/20"
          animate={{ scale: [1.1, 1, 1.1], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-[40%] top-[35%] h-[280px] w-[280px] rounded-full bg-violet-300/15 blur-3xl dark:bg-violet-500/15"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>

      {/* Soft grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pt-28" />

      {/* Floating tag icon */}
      <motion.div
        className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200/60 bg-white/60 shadow-lg shadow-indigo-500/10 backdrop-blur-md dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:shadow-indigo-900/40"
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Tag className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
        </motion.div>
      </motion.div>

      <motion.h1
        className="relative z-10 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Price{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-300 dark:to-violet-200">
          Scout
        </span>
      </motion.h1>

      <motion.p
        className="relative z-10 mt-5 max-w-xl text-lg text-slate-600 dark:text-indigo-100/70"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Search any product and see every retailer&apos;s price side by side —
        gathered from the web and ranked lowest to highest in seconds.
      </motion.p>

      <motion.div
        className="relative z-10 mt-6 flex flex-wrap justify-center gap-2"
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {SAMPLE_QUERIES.map((name, i) => (
          <motion.span
            key={name}
            className="rounded-full border border-indigo-200/80 bg-white/50 px-3.5 py-1 text-xs font-medium text-indigo-700/80 backdrop-blur-sm dark:border-indigo-500/25 dark:bg-indigo-950/40 dark:text-indigo-200/80"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.45 + i * 0.06,
              type: "spring",
              stiffness: 300,
            }}
            whileHover={{ scale: 1.06, y: -2 }}
          >
            {name}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="relative z-10 mt-10 flex flex-wrap justify-center gap-4"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {isSignedIn ? (
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-6 text-lg text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40"
            onClick={() => router.push("/dashboard")}
          >
            Go to your dashboard →
          </Button>
        ) : (
          <>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-6 text-lg text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40"
              >
                Sign in to start searching
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button
                variant="outline"
                size="lg"
                className="border-indigo-300 bg-white/40 px-10 py-6 text-lg text-indigo-700 backdrop-blur-sm hover:bg-white/70 dark:border-indigo-500/40 dark:bg-indigo-950/30 dark:text-indigo-200 dark:hover:bg-indigo-950/50"
              >
                Create account
              </Button>
            </Link>
          </>
        )}
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="relative z-10 mt-24 grid w-full max-w-5xl gap-5 pb-28 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            className="group rounded-2xl border border-indigo-200/70 bg-white/60 p-6 text-left shadow-lg shadow-indigo-500/5 backdrop-blur-md transition hover:border-indigo-300 hover:shadow-indigo-500/15 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:shadow-indigo-900/20 dark:hover:border-indigo-400/30"
            variants={{
              hidden: { opacity: 0, y: 36 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 dark:from-indigo-400/20 dark:to-purple-400/20">
              <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-indigo-50">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-indigo-200/65">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
