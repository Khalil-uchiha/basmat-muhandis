import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Variant = "auto" | "blue" | "white" | "ink";

/**
 * The club emblem. Ships three real artwork variants so the mark always sits
 * correctly on light, dark and brand surfaces.
 */
const Logo = ({
  className = "",
  variant = "auto",
  lockup = false,
  alt = "Basmat-Muhandis",
}: {
  className?: string;
  variant?: Variant;
  lockup?: boolean;
  alt?: string;
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolved: Exclude<Variant, "auto"> =
    variant !== "auto" ? variant : mounted && resolvedTheme === "dark" ? "white" : "blue";

  const src = `/logo-${lockup ? "full" : "mark"}-${resolved}.png`;

  return <img src={src} alt={alt} className={className} draggable={false} loading="eager" />;
};

export default Logo;
