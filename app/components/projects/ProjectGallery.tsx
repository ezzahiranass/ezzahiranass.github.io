"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ImageItem = { type: "image"; url: string; alt: string; caption?: string };
type VideoItem = { type: "video"; url: string; mimeType?: string };
export type GalleryItem = ImageItem | VideoItem;

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: ImageItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const imgWrapRef = useRef<HTMLDivElement>(null);

  // Reset zoom/pan when image changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [item.url]);

  // Wheel zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => Math.min(8, Math.max(1, s * (1 - e.deltaY * 0.0015))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Reset pan when scale returns to 1
  useEffect(() => {
    if (scale === 1) setTranslate({ x: 0, y: 0 });
  }, [scale]);

  // Keyboard navigation + close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, tx: translate.x, ty: translate.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setTranslate({
      x: dragOrigin.current.tx + (e.clientX - dragOrigin.current.mx),
      y: dragOrigin.current.ty + (e.clientY - dragOrigin.current.my),
    });
  };

  const onMouseUp = () => setDragging(false);

  const onDoubleClick = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in";

  return (
    <div className="gallery-lightbox" onClick={onClose}>
      <button className="gallery-lightbox__close" onClick={onClose} aria-label="Close">✕</button>

      {hasPrev && (
        <button
          className="gallery-lightbox__nav gallery-lightbox__nav--prev"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >←</button>
      )}
      {hasNext && (
        <button
          className="gallery-lightbox__nav gallery-lightbox__nav--next"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >→</button>
      )}

      <div
        ref={imgWrapRef}
        className="gallery-lightbox__img-wrap"
        style={{ cursor }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transformOrigin: "center",
            transition: dragging ? "none" : "transform 0.15s ease",
          }}
        >
          <Image
            src={item.url}
            alt={item.alt}
            fill
            style={{ objectFit: "contain", pointerEvents: "none" }}
            sizes="95vw"
            priority
          />
        </div>
      </div>

      {item.caption ? (
        <p className="gallery-lightbox__caption">{item.caption}</p>
      ) : null}

      <p className="gallery-lightbox__hint mono">
        scroll to zoom · drag to pan · double-click to reset
      </p>
    </div>
  );
}

export default function ProjectGallery({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const imageIndices = items.reduce<number[]>((acc, item, i) => {
    if (item.type === "image") acc.push(i);
    return acc;
  }, []);

  const close = useCallback(() => setActiveIndex(null), []);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    const pos = imageIndices.indexOf(activeIndex);
    if (pos < imageIndices.length - 1) setActiveIndex(imageIndices[pos + 1]);
  }, [activeIndex, imageIndices]);

  const goPrev = useCallback(() => {
    if (activeIndex === null) return;
    const pos = imageIndices.indexOf(activeIndex);
    if (pos > 0) setActiveIndex(imageIndices[pos - 1]);
  }, [activeIndex, imageIndices]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activePos = activeIndex !== null ? imageIndices.indexOf(activeIndex) : -1;

  return (
    <>
      <div className="project-masonry">
        {items.map((item, index) => {
          if (item.type === "video") {
            return (
              <figure key={index} className="project-masonry__item">
                <video className="project-video" controls playsInline preload="metadata">
                  <source src={item.url} type={item.mimeType ?? "video/mp4"} />
                </video>
              </figure>
            );
          }
          return (
            <figure
              key={index}
              className="project-masonry__item project-masonry__item--clickable"
              onClick={() => setActiveIndex(index)}
            >
              <Image src={item.url} alt={item.alt} width={1400} height={1000} />
              {item.caption ? (
                <figcaption className="project-gallery__caption">
                  <p>{item.caption}</p>
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      {activeItem && activeItem.type === "image" ? (
        <Lightbox
          item={activeItem}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={activePos > 0}
          hasNext={activePos < imageIndices.length - 1}
        />
      ) : null}
    </>
  );
}
