import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 36, y: 0 },
  right: { x: -36, y: 0 },
  none: { x: 0, y: 0 },
};

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  /** Render as a plain block instead of animating (useful inside grids) */
  once?: boolean;
}

const Reveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  direction = "up",
  once = true,
}: Props) => {
  const { x, y } = offset[direction];
  const variants: Variants = {
    // Only opacity and transform — both run on the compositor. Animating
    // `filter` here forced a full repaint of each section on every frame.
    hidden: { opacity: 0, x, y },
    show: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
