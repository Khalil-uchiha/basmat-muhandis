import { useEffect, useRef } from "react";

/**
 * The site's dark backdrop — an engineering drawing sheet.
 *
 * Layers, back to front: a navy wash with brand light, a two-weight blueprint
 * grid, PCB traces with a signal pulse, a line drawing of a 3-axis robot arm
 * with dimension annotations, and drawing-sheet registration marks.
 *
 * Cost is kept low on purpose: everything is static vector art except the
 * arm's three joints (CSS rotation) and the trace pulses (stroke-dashoffset).
 * Each SVG sits on its own layer so its repaint stays local, and all motion
 * pauses while the backdrop is scrolled out of view.
 */
const Backdrop = ({ tone = "hero" }: { tone?: "hero" | "panel" }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Stop the joint/pulse animations entirely when nobody can see them.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? "false" : "true";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hero = tone === "hero";

  return (
    <div ref={ref} aria-hidden className="bm-backdrop pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60rem 36rem at 10% -10%, hsl(var(--brand) / ${hero ? 0.26 : 0.18}), transparent 62%),
            radial-gradient(46rem 30rem at 100% 100%, hsl(214 90% 50% / ${hero ? 0.12 : 0.08}), transparent 60%),
            linear-gradient(180deg, hsl(216 44% 10%) 0%, hsl(215 46% 7%) 55%, hsl(215 42% 5.5%) 100%)
          `,
        }}
      />

      {/* Blueprint grid — fine minor lines with heavier major lines every 5 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(210 100% 80% / 0.07) 1px, transparent 1px),
            linear-gradient(90deg, hsl(210 100% 80% / 0.07) 1px, transparent 1px),
            linear-gradient(hsl(210 100% 80% / 0.028) 1px, transparent 1px),
            linear-gradient(90deg, hsl(210 100% 80% / 0.028) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px, 80px 80px, 16px 16px, 16px 16px",
          maskImage: "radial-gradient(120% 95% at 50% 10%, #000 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(120% 95% at 50% 10%, #000 40%, transparent 90%)",
        }}
      />

      {/* PCB traces, lower left */}
      <CircuitTraces
        className={`absolute bottom-0 left-0 text-[hsl(var(--brand-bright))] [will-change:transform] ${
          hero ? "h-[46%] min-h-[220px] opacity-[0.22]" : "h-[85%] opacity-[0.16]"
        }`}
      />

      {/* Robot arm, right — desktop only, so it never sits behind body copy */}
      <RobotArm
        className={`absolute hidden text-[hsl(var(--brand-bright))] [will-change:transform] lg:block ${
          hero
            ? "right-[2%] bottom-[3%] h-[88%] opacity-[0.26]"
            : "-bottom-[30%] right-[3%] h-[160%] opacity-[0.15]"
        }`}
      />

      {/* Drawing-sheet registration marks and title strip */}
      <SheetFrame label={hero ? "BM-RB/01 · 3-AXIS MANIPULATOR · REV A" : "BM-RB/02 · REV A"} />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 90% at 45% 40%, transparent 55%, hsl(215 45% 4% / 0.6) 100%)",
        }}
      />
    </div>
  );
};

/* ----------------------------------------------------------------- pieces */

/**
 * Line drawing of a 3-axis arm. Joints are nested groups so the CSS rotations
 * compound like real forward kinematics: moving the shoulder carries the
 * elbow and wrist with it.
 */
const RobotArm = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 800 820" fill="none" className={className} preserveAspectRatio="xMaxYMax meet">
    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* floor */}
      <path d="M90 762 H730" strokeDasharray="2 9" opacity="0.7" />

      {/* base plate + turret */}
      <rect x="250" y="722" width="300" height="40" rx="5" />
      <path d="M270 742 H530" opacity="0.45" />
      <circle cx="282" cy="742" r="6" />
      <circle cx="518" cy="742" r="6" />
      <path d="M300 722 L336 650 H464 L500 722" />
      <path d="M336 650 H464" />
      <path d="M352 686 H448" opacity="0.45" />

      {/* shoulder (J1) and everything it carries */}
      <g className="bm-arm-shoulder">
        <g transform="translate(400 610) rotate(-112.62)">
          <rect x="-12" y="-30" width="284" height="60" rx="30" />
          <path d="M44 -14 H216 M44 14 H216" opacity="0.4" />
          <circle cx="130" cy="0" r="6" opacity="0.6" />
        </g>
        <circle cx="400" cy="610" r="50" />
        <circle cx="400" cy="610" r="20" />
        <path d="M374 610 H426 M400 584 V636" opacity="0.55" />
        <text x="462" y="668" className="bm-label">J1</text>

        {/* elbow (J2) */}
        <g className="bm-arm-elbow">
          <g transform="translate(300 370) rotate(-22.93)">
            <rect x="-10" y="-24" width="296" height="48" rx="24" />
            <path d="M38 0 H252" strokeDasharray="6 7" opacity="0.4" />
          </g>
          <circle cx="300" cy="370" r="40" />
          <circle cx="300" cy="370" r="15" />
          <path d="M278 370 H322 M300 348 V392" opacity="0.55" />
          <text x="232" y="330" className="bm-label">J2</text>

          {/* wrist (J3) + gripper */}
          <g className="bm-arm-wrist">
            <g transform="translate(560 260) rotate(26.57)">
              <rect x="-8" y="-17" width="98" height="34" rx="17" />
              <rect x="88" y="-26" width="22" height="52" rx="3" />
              <path d="M110 -21 L150 -32 L155 -19 L117 -11" />
              <path d="M110 21 L150 32 L155 19 L117 11" />
            </g>
            <circle cx="560" cy="260" r="30" />
            <circle cx="560" cy="260" r="11" />
            <text x="590" y="214" className="bm-label">J3</text>
          </g>
        </g>
      </g>

      {/* cable loom from turret to elbow */}
      <path d="M452 650 C 520 560, 430 470, 336 404" strokeDasharray="3 6" opacity="0.5" />
    </g>

    {/* annotations — thinner and dimmer than the part outlines */}
    <g stroke="currentColor" strokeWidth="1" opacity="0.6">
      {/* reach envelope */}
      <path d="M118 507 A300 300 0 0 1 695 558" strokeDasharray="1 7" />
      {/* base width dimension */}
      <path d="M250 790 H550 M250 782 V798 M550 782 V798" />
      <path d="M250 790 l10 -4 M250 790 l10 4 M550 790 l-10 -4 M550 790 l-10 4" />
    </g>
    <g fill="currentColor" className="bm-label-group">
      <text x="400" y="812" textAnchor="middle" className="bm-label">Ø 300</text>
      <text x="408" y="300" className="bm-label">REACH R 540</text>
      <text x="96" y="752" className="bm-label">FLOOR ±0.00</text>
    </g>
  </svg>
);

/** PCB traces with 45° bends, vias and an IC, plus travelling signal pulses. */
const CircuitTraces = ({ className = "" }: { className?: string }) => {
  const traces = [
    "M0 352 H124 L164 312 H300 L330 282 H430",
    "M0 382 H186 L216 352 H372",
    "M0 300 H72 L112 260 V188 L142 158 H232",
    "M0 248 H40 L70 218 V120",
    "M320 182 H412 L452 142 H560",
  ];
  const vias: [number, number][] = [
    [430, 282],
    [372, 352],
    [70, 120],
    [560, 142],
    [164, 312],
  ];

  return (
    <svg viewBox="0 0 600 400" fill="none" className={className} preserveAspectRatio="xMinYMax meet">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {traces.map((d) => (
          <path key={d} d={d} opacity="0.75" />
        ))}

        {/* IC package */}
        <rect x="232" y="132" width="88" height="60" rx="4" />
        <circle cx="244" cy="144" r="3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`t${i}`} d={`M${246 + i * 15} 132 V120 M${246 + i * 15} 192 V204`} opacity="0.75" />
        ))}

        {vias.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="6" />
            <circle cx={x} cy={y} r="2" fill="currentColor" />
          </g>
        ))}
      </g>

      {/* signal pulses travelling along three of the traces */}
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none">
        {traces.slice(0, 3).map((d, i) => (
          <path
            key={`p${i}`}
            d={d}
            pathLength={100}
            className="bm-signal"
            style={{ animationDelay: `${i * 1.3}s` }}
          />
        ))}
      </g>
    </svg>
  );
};

/** Corner registration marks, an edge ruler and a title strip. */
const SheetFrame = ({ label }: { label: string }) => (
  <div className="absolute inset-x-3 bottom-3 top-24 sm:inset-x-6 sm:bottom-6 sm:top-24">
    {/* corners */}
    <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-white/20" />
    <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-white/20" />
    <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/20" />
    <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/20" />

    {/* bottom ruler */}
    <span
      className="absolute inset-x-8 bottom-0 hidden h-2 sm:block"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, hsl(210 100% 85% / 0.22) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, hsl(210 100% 85% / 0.12) 0 1px, transparent 1px 8px)",
        backgroundSize: "100% 8px, 100% 4px",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom, bottom",
      }}
    />

    {/* title strip */}
    <span className="absolute bottom-3 left-6 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 md:block">
      {label}
    </span>
    <span className="absolute bottom-3 right-6 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 md:block">
      Scale 1:10 · mm
    </span>
  </div>
);

export default Backdrop;
