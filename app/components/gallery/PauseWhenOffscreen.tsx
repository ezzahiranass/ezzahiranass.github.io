"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "../../lib/useInView";

// Wraps the marquee rows and pauses their CSS animation while off screen.
export default function PauseWhenOffscreen({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { rootMargin: "200px 0px" });

  return (
    <div ref={ref} className={`${className ?? ""}${inView ? "" : " is-paused"}`}>
      {children}
    </div>
  );
}
