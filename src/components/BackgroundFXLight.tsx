// components/BackgroundFXLight.tsx
"use client";

type Props = {
  limeOpacity?: number;     // 0..1  (default 0.18)
  whiteOpacity?: number;    // 0..1  (default 0.10)
  limeSize?: number;        // px    (default 420)
  whiteSize?: number;       // px    (default 500)
  limeOffset?: { top?: string; left?: string };     // e.g. { top: "-8%", left: "-8%" }
  whiteOffset?: { bottom?: string; right?: string }; // e.g. { bottom: "-10%", right: "-6%" }
};

export default function BackgroundFXLight({
  limeOpacity = 0.18,
  whiteOpacity = 0.10,
  limeSize = 420,
  whiteSize = 500,
  limeOffset = { top: "-8%", left: "-8%" },
  whiteOffset = { bottom: "-10%", right: "-6%" },
}: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Lime spotlight (subtle) */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: `${limeSize}px`,
          height: `${limeSize}px`,
          background:
            "radial-gradient(circle at center, rgba(190,242,100,0.65) 0%, rgba(190,242,100,0.22) 40%, rgba(190,242,100,0) 70%)",
          opacity: limeOpacity,
          top: limeOffset.top ?? undefined,
          left: limeOffset.left ?? undefined,
        }}
      />

      {/* Soft white spotlight (very subtle) */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: `${whiteSize}px`,
          height: `${whiteSize}px`,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 70%)",
          opacity: whiteOpacity,
          bottom: whiteOffset.bottom ?? undefined,
          right: whiteOffset.right ?? undefined,
        }}
      />
    </div>
  );
}