"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { assetPath } from "../lib/assetPath";

type CutoutHeroProps = {
  anchorId?: string;
  className?: string;
  enableMotion?: boolean;
};

export default function CutoutHero({
  anchorId = "hero",
  className = "",
  enableMotion = true,
}: CutoutHeroProps) {
  const motionRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const target = motionRef.current;
    if (!target) return;

    if (!enableMotion) {
      target.style.setProperty("--cutout-shift", "0px");
      return;
    }

    const update = () => {
      const anchor = document.getElementById(anchorId);
      if (!anchor || !motionRef.current) return;

      const viewportHeight = window.innerHeight || 1;
      const start = anchor.offsetTop;
      const end = start + viewportHeight;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(
        Math.max((scrollY - start) / Math.max(end - start, 1), 0),
        1
      );
      const anchorWidth = anchor.clientWidth || 1;
      const targetWidth = motionRef.current.offsetWidth || 0;
      const maxShift = Math.max(anchorWidth - targetWidth, 0) * 0.5;
      const shift = -Math.round(maxShift * progress);

      motionRef.current.style.setProperty("--cutout-shift", `${shift}px`);
    };

    const onScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [anchorId, enableMotion]);

  return (
    <div className={`cutout-wrap ${className}`.trim()}>
      <div
        ref={motionRef}
        className="cutout-motion"
        style={!enableMotion ? { ["--cutout-shift" as string]: "0px" } : undefined}
      >
        <Image
          alt="Cutout detail"
          className="cutout-img cutout-img--base"
          height={500}
          src={assetPath("/images/cutout3.png")}
          unoptimized
          width={500}
        />
        <Image
          alt="Cutout detail hover"
          className="cutout-img cutout-img--hover"
          height={500}
          src={assetPath("/images/cutout2.png")}
          unoptimized
          width={500}
        />
      </div>
    </div>
  );
}
