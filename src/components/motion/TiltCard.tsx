import type { ReactNode } from "react";

/**
 * A restrained hover lift for cards.
 *
 * This used to track the pointer and drive four springs plus a cursor-following
 * sheen, per card. Across the project that is seventeen instances — on the
 * projects grid, nine of them side by side — which meant a stream of pointer
 * events and spring integrations competing with scrolling. The effect now runs
 * entirely on the compositor: a transform and a shadow, driven by CSS hover.
 *
 * The props are kept so call sites did not have to change; `max` is accepted
 * and ignored.
 */
const TiltCard = ({
  children,
  className = "",
  max,
}: {
  children: ReactNode;
  className?: string;
  /** @deprecated kept for call-site compatibility; the tilt is no longer 3D. */
  max?: number;
}) => {
  void max;
  return (
    <div
      className={`group relative transition-transform duration-500 ease-smooth will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      {children}
    </div>
  );
};

export default TiltCard;
