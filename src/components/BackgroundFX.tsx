// components/BackgroundFX.tsx
"use client";

type Mode = "section" | "fixed";

type Spotlight = {
  show?: boolean;
  size?: number;          // px
  opacity?: number;       // 0..1
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  translateX?: string;    // e.g. "-30%"
  translateY?: string;    // e.g. "20%"
};

export default function BackgroundFX({
  mode = "section",
  lime = {},
  white = {},
  className = "",
}: {
  mode?: Mode;
  lime?: Spotlight;
  white?: Spotlight;
  className?: string;
}) {
  // ---- Defaults (match your homepage look) ----
  const limeDefaults: Spotlight =
    mode === "fixed"
      ? {
          // Match section-mode visual without % translates
          show: true,
          size: 520,
          opacity: 0.30,
          top: "-28px",
          left: "-28px",
          // No translate in fixed so position is identical across pages
        }
      : {
          show: true,
          size: 520,
          opacity: 0.30,
          top: "-28px",
          left: "-28px",
        };

  const whiteDefaults: Spotlight =
    mode === "fixed"
      ? {
          // Match section-mode visual without % translates
          show: true,
          size: 560,
          opacity: 0.22,
          bottom: "-140px",
          right: "-140px",
          // No translate in fixed
        }
      : {
          show: true,
          size: 560,
          opacity: 0.22,
          bottom: "-140px",
          right: "-140px",
        };

  const L = { ...limeDefaults, ...lime };
  const W = { ...whiteDefaults, ...white };

  // Container positioning differs by mode
  const containerClass =
    mode === "fixed"
      ? "pointer-events-none fixed inset-0 z-0"
      : "pointer-events-none absolute inset-0 z-0";

  return (
    <div aria-hidden className={`${containerClass} ${className}`}>
      {/* Lime spotlight */}
      {L.show !== false && (
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: L.size ?? 520,
            height: L.size ?? 520,
            background:
              "radial-gradient(circle at center, rgba(190,242,100,0.60) 0%, rgba(190,242,100,0.22) 42%, rgba(190,242,100,0) 70%)",
            opacity: L.opacity ?? 0.30,
            top: L.top,
            left: L.left,
            right: L.right,
            bottom: L.bottom,
            // Only apply translate if caller explicitly passes it
            transform:
              L.translateX || L.translateY
                ? `translate(${L.translateX ?? "0px"}, ${L.translateY ?? "0px"})`
                : undefined,
          }}
        />
      )}

      {/* White spotlight */}
      {W.show !== false && (
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: W.size ?? 560,
            height: W.size ?? 560,
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 70%)",
            opacity: W.opacity ?? 0.22,
            top: W.top,
            left: W.left,
            right: W.right,
            bottom: W.bottom,
            transform:
              W.translateX || W.translateY
                ? `translate(${W.translateX ?? "0px"}, ${W.translateY ?? "0px"})`
                : undefined,
          }}
        />
      )}
    </div>
  );
}