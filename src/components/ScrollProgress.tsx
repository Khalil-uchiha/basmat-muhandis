import { motion, useScroll, useSpring } from "framer-motion";

/** Thin brand-coloured reading indicator pinned to the very top of the page. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-brand-bright to-accent"
    />
  );
};

export default ScrollProgress;
