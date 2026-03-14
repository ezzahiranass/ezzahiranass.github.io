"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GalleryImage } from "../../lib/sanity";

export default function GalleryScroller({ items }: { items: GalleryImage[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const isResettingRef = useRef(false);

  const loopedItems = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items, ...items];
  }, [items]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const segment = rail.scrollWidth / 3;
    if (segment > 0) rail.scrollLeft = segment;
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let rafId = 0;
    let isPaused = false;

    const handleEnter = () => { isPaused = true; };
    const handleLeave = () => { isPaused = false; };

    rail.addEventListener("mouseenter", handleEnter);
    rail.addEventListener("mouseleave", handleLeave);

    const step = () => {
      if (!isPaused) rail.scrollLeft += 0.5;
      rafId = window.requestAnimationFrame(step);
    };
    rafId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(rafId);
      rail.removeEventListener("mouseenter", handleEnter);
      rail.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const handleScroll = () => {
    const rail = railRef.current;
    if (!rail || isResettingRef.current) return;
    const segment = rail.scrollWidth / 3;
    if (segment === 0) return;
    if (rail.scrollLeft < segment * 0.55) {
      isResettingRef.current = true;
      rail.scrollLeft += segment;
      isResettingRef.current = false;
    }
    if (rail.scrollLeft > segment * 1.45) {
      isResettingRef.current = true;
      rail.scrollLeft -= segment;
      isResettingRef.current = false;
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="gallery-scroller hide-scrollbar" ref={railRef} onScroll={handleScroll}>
      {loopedItems.map((item, index) => (
        <div key={`${item.url}-${index}`} className="gallery-card">
          <div className="gallery-media">
            <img src={item.url} alt={item.projectTitle} loading="lazy" />
          </div>
          <div className="gallery-caption">
            <div className="mono">{item.projectTitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
