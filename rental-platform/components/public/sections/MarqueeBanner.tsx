// ═══════════════════════════════════════════════════════════
// components/public/sections/MarqueeBanner.tsx
// Pure CSS infinite scrolling marquee — no JavaScript animation
// ═══════════════════════════════════════════════════════════

const MARQUEE_ITEMS = [
  "Premium Villas",
  "Beachfront Chalets",
  "Studio Retreats",
  "Sea Views",
  "Private Pools",
  "Luxury Stays",
  "Curated Experiences",
  "Coastal Living",
];

const SEPARATOR = "✦";

export function MarqueeBanner() {
  // Render the full item strip — duplicated for seamless loop
  const renderStrip = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {MARQUEE_ITEMS.map((item, index) => (
        <span key={index} className="mx-6 flex items-center gap-6">
          <span className="text-xs text-white/30">{SEPARATOR}</span>
          <span className="whitespace-nowrap font-body text-sm uppercase tracking-[0.2em] text-white">
            {item}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section
      className="select-none overflow-hidden bg-neutral-900 py-4"
      aria-label="Feature highlights"
    >
      {/* Accessible static text for screen readers */}
      <div className="sr-only">{MARQUEE_ITEMS.join(", ")}</div>

      {/* Scrolling marquee — two copies for seamless loop */}
      <div className="animate-marquee group flex hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]">
        {renderStrip()}
        {renderStrip()}
      </div>
    </section>
  );
}
