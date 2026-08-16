// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { Check, ImageOff } from "lucide-react";
// import { BACKGROUNDS, useBackground } from "@/app/context/BackgroundContext";
// import { useState } from "react";

// export default function SettingsPage() {
//   const { selected, setBackground } = useBackground();
//   const [previewId, setPreviewId] = useState<string | null>(null);

//   const activeId = previewId ?? selected.id;
//   const activeBg = BACKGROUNDS.find((b) => b.id === activeId) ?? BACKGROUNDS[0];

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
//           Settings
//         </h1>
//         <p className="text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
//           Personalise your game board experience
//         </p>
//       </div>

//       {/* Section */}
//       <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
//         <h2 className="text-base font-semibold text-white mb-1">
//           Game Board Background
//         </h2>
//         <p className="text-sm text-white/70 mb-5">
//           Hover to preview · click to select · saved automatically
//         </p>

//         {/* Live preview strip */}
//         <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 border border-white/30">
//           {/* Actual background — img tag is most reliable */}
//           {activeBg.src ? (
//             <img
//               src={activeBg.src}
//               alt=""
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           ) : (
//             <div
//               className="absolute inset-0"
//               style={{
//                 background:
//                   "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
//               }}
//             />
//           )}
//           {activeBg.overlay && (
//             <div
//               className="absolute inset-0"
//               style={{ background: activeBg.overlay }}
//             />
//           )}
//           {/* Preview label */}
//           <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold z-10">
//             {activeBg.label}
//           </div>
//           {/* Mini demo cards */}
//           <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-40 pointer-events-none z-10">
//             {[0, 1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="w-8 h-12 rounded-lg bg-white/20 border border-white/30"
//                 style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Grid of options */}
//         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
//           {BACKGROUNDS.map((bg) => {
//             const isSelected = selected.id === bg.id;
//             return (
//               <motion.button
//                 key={bg.id}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.96 }}
//                 onMouseEnter={() => setPreviewId(bg.id)}
//                 onMouseLeave={() => setPreviewId(null)}
//                 onClick={() => setBackground(bg.id)}
//                 className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all focus:outline-none group"
//                 style={{
//                   borderColor: isSelected ? "#ffffff" : "transparent",
//                   boxShadow: isSelected
//                     ? "0 0 0 1px #ffffff, 0 0 16px rgba(255,255,255,0.4)"
//                     : "0 2px 8px rgba(0,0,0,0.2)",
//                 }}
//               >
//                 {/* Thumbnail or CSS fallback */}
//                 {bg.thumbnail ? (
//                   <img
//                     src={bg.thumbnail}
//                     alt={bg.label}
//                     className="absolute inset-0 w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div
//                     className="absolute inset-0"
//                     style={{
//                       background:
//                         "radial-gradient(ellipse at 38% 32%, #1a4a2e 0%, #0f2d1c 50%, #091a10 100%)",
//                     }}
//                   >
//                     <div
//                       className="absolute inset-0 opacity-50"
//                       style={{
//                         backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
//                         backgroundSize: "100px 100px",
//                       }}
//                     />
//                   </div>
//                 )}

//                 {/* Overlay tint */}
//                 {bg.overlay && (
//                   <div
//                     className="absolute inset-0"
//                     style={{ background: bg.overlay }}
//                   />
//                 )}

//                 {/* Hover glass tint */}
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

//                 {/* No thumbnail placeholder */}
//                 {!bg.thumbnail && bg.id !== "felt" && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <ImageOff size={16} className="text-white/50" />
//                   </div>
//                 )}

//                 {/* Label */}
//                 <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 backdrop-blur-sm">
//                   <p className="text-white text-[9px] font-semibold text-center truncate">
//                     {bg.label}
//                   </p>
//                 </div>

//                 {/* Selected checkmark */}
//                 <AnimatePresence>
//                   {isSelected && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.5 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.5 }}
//                       className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/50"
//                     >
//                       <Check size={11} className="text-white" />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.button>
//             );
//           })}
//         </div>
//       </div>

//       {/* How to add backgrounds hint */}
//       {/* <div className="p-4 rounded-2xl border border-dashed border-white/30 text-sm text-white/60">
//         <p className="font-semibold mb-1 text-white/70">
//           Adding custom backgrounds
//         </p>
//         <p>
//           Drop image files into{" "}
//           <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono text-white">
//             /public/backgrounds/
//           </code>{" "}
//           and register them in{" "}
//           <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono text-white">
//             BackgroundContext.tsx
//           </code>
//           . Recommended: 1920×1080 JPG for{" "}
//           <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono text-white">
//             src
//           </code>
//           , 400×225 JPG for{" "}
//           <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono text-white">
//             thumbnail
//           </code>
//           .
//         </p>
//       </div> */}
//     </div>
//   );
// }
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageOff, Globe2 } from "lucide-react";
import { BACKGROUNDS, useBackground } from "@/app/context/BackgroundContext";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COUNTRIES } from "@/convex/lib";
import { useUserContext } from "@/app/context/UserContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { selected, setBackground } = useBackground();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const activeId = previewId ?? selected.id;
  const activeBg = BACKGROUNDS.find((b) => b.id === activeId) ?? BACKGROUNDS[0];

  const user = useUserContext();
  const setCountry = useMutation(api.users.setCountry);
  const [savingCountry, setSavingCountry] = useState<string | null>(null);
  const currentCountry = user?.country ?? "za";

  async function handleCountrySelect(code: string) {
    if (code === currentCountry) return;
    setSavingCountry(code);
    try {
      await setCountry({ country: code });
    } catch {
      toast.error("Couldn't update your region — try again.");
    } finally {
      setSavingCountry(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          Settings
        </h1>
        <p className="text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          Personalise your search experience
        </p>
      </div>

      {/* Region section */}
      <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-white/70" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Region &amp; currency
            </h2>
            <p className="text-sm text-white/70">
              Searches default to retailers and pricing for this country — e.g.
              South Africa surfaces Takealot, Makro, and prices in Rand.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COUNTRIES.map((country) => {
            const isSelected = currentCountry === country.code;
            const isSaving = savingCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                disabled={isSaving}
                className="relative flex flex-col gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition-all disabled:opacity-60"
                style={{
                  borderColor: isSelected
                    ? "#ffffff"
                    : "rgba(255,255,255,0.15)",
                  background: isSelected
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-sm font-semibold text-white">
                  {country.label}
                </span>
                <span className="text-xs text-white/60">
                  {country.currency}
                </span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                    >
                      <Check size={11} className="text-black" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section */}
      <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
        <h2 className="text-base font-semibold text-white mb-1">
          Game Board Background
        </h2>
        <p className="text-sm text-white/70 mb-5">
          Hover to preview · click to select · saved automatically
        </p>

        {/* Live preview strip */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 border border-white/30">
          {/* Actual background --- img tag is most reliable */}
          {activeBg.src ? (
            <img
              src={activeBg.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
              }}
            />
          )}
          {activeBg.overlay && (
            <div
              className="absolute inset-0"
              style={{ background: activeBg.overlay }}
            />
          )}
          {/* Preview label */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold z-10">
            {activeBg.label}
          </div>
          {/* Mini demo cards */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-40 pointer-events-none z-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-12 rounded-lg bg-white/20 border border-white/30"
                style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
              />
            ))}
          </div>
        </div>

        {/* Grid of options */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BACKGROUNDS.map((bg) => {
            const isSelected = selected.id === bg.id;
            return (
              <motion.button
                key={bg.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setPreviewId(bg.id)}
                onMouseLeave={() => setPreviewId(null)}
                onClick={() => setBackground(bg.id)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all focus:outline-none group"
                style={{
                  borderColor: isSelected ? "#ffffff" : "transparent",
                  boxShadow: isSelected
                    ? "0 0 0 1px #ffffff, 0 0 16px rgba(255,255,255,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Thumbnail or CSS fallback */}
                {bg.thumbnail ? (
                  <img
                    src={bg.thumbnail}
                    alt={bg.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at 38% 32%, #1a4a2e 0%, #0f2d1c 50%, #091a10 100%)",
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                        backgroundSize: "100px 100px",
                      }}
                    />
                  </div>
                )}
                {/* Overlay tint */}
                {bg.overlay && (
                  <div
                    className="absolute inset-0"
                    style={{ background: bg.overlay }}
                  />
                )}
                {/* Hover glass tint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {/* No thumbnail placeholder */}
                {!bg.thumbnail && bg.id !== "felt" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff size={16} className="text-white/50" />
                  </div>
                )}
                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 backdrop-blur-sm">
                  <p className="text-white text-[9px] font-semibold text-center truncate">
                    {bg.label}
                  </p>
                </div>
                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/50"
                    >
                      <Check size={11} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
