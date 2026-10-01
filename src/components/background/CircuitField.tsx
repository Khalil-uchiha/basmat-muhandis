import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** current outward push from the cursor, decays every frame */
  px: number;
  py: number;
};

const LINK_DISTANCE = 140;
const CURSOR_RADIUS = 190;
const DENSITY = 19000; // one node per N css pixels
const MAX_FPS = 40;

/**
 * Interactive particle constellation drawn on a canvas.
 * Nodes drift on their own, lean away from the cursor, and link up with
 * their neighbours — a quiet nod to circuit traces and fingerprint ridges.
 */
const CircuitField = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let frame = 0;
    let last = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };

    const readBrand = () => {
      const styles = getComputedStyle(document.documentElement);
      const brand = styles.getPropertyValue("--brand").trim() || "217 100% 49%";
      const accent = styles.getPropertyValue("--accent").trim() || "40 62% 52%";
      return { brand, accent, dark: document.documentElement.classList.contains("dark") };
    };
    let theme = readBrand();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.max(24, Math.round((width * height) / DENSITY)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.9,
        px: 0,
        py: 0,
      }));
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);

      // Skip work while scrolled past, and cap the frame rate
      if (!visible || now - last < 1000 / MAX_FPS) return;
      last = now;

      ctx.clearRect(0, 0, width, height);
      const { brand, accent, dark } = theme;
      const lineAlpha = dark ? 0.5 : 0.34;
      const dotAlpha = dark ? 0.85 : 0.6;

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx + n.px;
          n.y += n.vy + n.py;
          n.px *= 0.9;
          n.py *= 0.9;
        }

        // wrap around the edges so the field never thins out
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS && dist > 0.01) {
            const force = (1 - dist / CURSOR_RADIUS) * 0.9;
            n.px += (dx / dist) * force;
            n.py += (dy / dist) * force;
          }
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;

          const strength = 1 - dist / LINK_DISTANCE;
          // links near the cursor warm up toward the accent tone
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const near = pointer.active
            ? Math.max(0, 1 - Math.hypot(mid.x - pointer.x, mid.y - pointer.y) / CURSOR_RADIUS)
            : 0;

          ctx.strokeStyle = `hsl(${near > 0.35 ? accent : brand} / ${strength * lineAlpha})`;
          ctx.lineWidth = 0.6 + near * 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        const near = pointer.active
          ? Math.max(0, 1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / CURSOR_RADIUS)
          : 0;
        ctx.fillStyle = `hsl(${near > 0.5 ? accent : brand} / ${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + near * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    frame = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(build);
    resizeObserver.observe(canvas);

    // Stop burning frames once the field scrolls out of view
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    const themeObserver = new MutationObserver(() => {
      theme = readBrand();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`h-full w-full ${className}`} />;
};

export default CircuitField;
