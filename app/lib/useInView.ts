"use client";

import { useEffect, useState, type RefObject } from "react";

type InViewOptions = {
  /** Grow/shrink the viewport box used for the check, e.g. "300px 0px". */
  rootMargin?: string;
  /** Stop observing after the element has been seen once. */
  once?: boolean;
};

/**
 * Tracks whether an element is on screen. Used to pause render loops
 * (WebGL canvases, particle fields, marquees) while they are off screen.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", once = false }: InViewOptions = {}
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setInView(visible);
        if (visible && once) observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}
