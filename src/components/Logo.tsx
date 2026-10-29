import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Variant = "auto" | "blue" | "white" | "ink";

/**
 * The club emblem. Ships three real artwork variants so the mark always sits
 * correctly on light, dark and brand surfaces, as WebP with a PNG fallback.
 */
const Logo = ({
  className = "",
  variant = "auto",
  lockup = false,
  alt = "Basmat-Muhandis",
  priority = false,
}: {
  className?: string;
  variant?: Variant;
  lockup?: boolean;
  alt?: string;
  /** Set on the one logo that is visible before any scrolling. */
  priority?: boolean;
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolved: Exclude<Variant, "auto"> =
    variant !== "auto" ? variant : mounted && resolvedTheme === "dark" ? "white" : "blue";

  const base = `/logo-${lockup ? "full" : "mark"}-${resolved}`;

  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.png`}
        alt={alt}
        className={className}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // React 18 only forwards the lowercase form of this attribute.
        {...(priority ? { fetchpriority: "high" } : {})}
      />
    </picture>
  );
};

export default Logo;
