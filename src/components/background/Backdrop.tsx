import type { MotionValue } from "framer-motion";
import { Component, type ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";

/**
 * The site's dark backdrop: a painted navy base with a live 3D robot arm on
 * top. The arm's code (three.js) is fetched after first paint, so the page
 * never waits on it; until it arrives — or if WebGL is unavailable — the
 * painted base is the whole backdrop.
 */
const RobotScene = lazy(() => import("../three/RobotScene"));

/** If WebGL fails mid-session, drop the scene rather than the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const Backdrop = ({
  tone = "hero",
  progress,
}: {
  tone?: "hero" | "panel";
  progress?: MotionValue<number>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(supportsWebGL);
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);

  // Stop rendering the moment the backdrop scrolls out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Inner-page headers are short; on narrow screens the arm would sit behind
  // the title, so it is shown there from the lg breakpoint only.
  const showScene = webgl && (tone === "hero" || wide);
  const hero = tone === "hero";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Painted base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60rem 38rem at 78% 18%, hsl(var(--brand) / ${hero ? 0.22 : 0.16}), transparent 65%),
            radial-gradient(50rem 30rem at 5% 0%, hsl(214 90% 50% / ${hero ? 0.14 : 0.1}), transparent 60%),
            linear-gradient(180deg, hsl(216 46% 10%) 0%, hsl(215 48% 7%) 60%, hsl(215 45% 5.5%) 100%)
          `,
        }}
      />

      {showScene && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <RobotScene variant={tone} active={visible} progress={progress} />
          </Suspense>
        </SceneBoundary>
      )}

      {/* Readability scrims: keep the copy column calm over the scene. */}
      <div className="absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-[hsl(215_46%_7%/0.9)] via-[hsl(215_46%_7%/0.55)] to-transparent lg:hidden" />
      <div className="absolute inset-y-0 start-0 hidden w-[62%] bg-gradient-to-r from-[hsl(215_46%_7%/0.92)] via-[hsl(215_46%_7%/0.55)] to-transparent rtl:bg-gradient-to-l lg:block" />

      {/* Bottom fade into the page */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(215_45%_5.5%)] to-transparent" />
    </div>
  );
};

export default Backdrop;
