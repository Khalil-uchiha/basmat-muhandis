import type { ReactNode } from "react";

/** Seamless horizontal ticker — duplicates its children and scrolls by 50%. */
const Marquee = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`group relative flex overflow-hidden mask-fade-x ${className}`}>
    <div className="flex min-w-full shrink-0 animate-scroll-x items-center gap-4 group-hover:[animation-play-state:paused]">
      {children}
      {children}
    </div>
  </div>
);

export default Marquee;
