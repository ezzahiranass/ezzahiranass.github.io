"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import {
  getProjectPdfUrl,
  type SanityProject,
} from "../../lib/sanity";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Cap absolute DPR to balance sharpness vs memory.
// At width=900 the canvas pixel area scales as DPR²-ish once height is included:
//   DPR 3 → 2700×3800px ≈  41 MB  (was too low — pixelates past zoom ~1.5× on retina)
//   DPR 6 → 5400×7600px ≈ 164 MB  (two slots in flight ≈ 328 MB — fine on desktop)
//   DPR 8 → 7200×10k px ≈ 290 MB  (two slots ≈ 580 MB — reliable crash territory)
const MAX_DPR = 6;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Renders a PDF page with smooth LOD transitions via A/B slot buffering.
 *
 * Two Page instances are always mounted (stable keys 0 and 1).
 * The active slot is visible; the standby slot renders the next LOD
 * hidden in the background. When the standby finishes, it becomes
 * the active slot — no blank flash, no layout shift.
 *
 * Reset the component (via key prop) when pageNumber changes so the
 * old-page canvas never flashes while the new page loads.
 */
function PdfLodPage({
  pageNumber,
  targetDpr,
  width,
}: {
  pageNumber: number;
  targetDpr: number;
  width: number;
}) {
  // Debounce so we don't kick off a new render on every zoom animation frame.
  const debouncedDpr = useDebounce(targetDpr, 180);

  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slotDprs, setSlotDprs] = useState<[number, number]>([
    debouncedDpr,
    debouncedDpr,
  ]);

  // Refs let callbacks read the latest values without stale closures.
  const pendingDprRef = useRef(debouncedDpr);
  const activeSlotRef = useRef<0 | 1>(0);
  activeSlotRef.current = activeSlot; // updated every render

  // When the target DPR settles, queue a render into the standby slot.
  useEffect(() => {
    pendingDprRef.current = debouncedDpr;
    setSlotDprs((prev) => {
      const standby: 0 | 1 = activeSlotRef.current === 0 ? 1 : 0;
      if (prev[standby] === debouncedDpr) return prev; // already queued
      const next: [number, number] = [prev[0], prev[1]];
      next[standby] = debouncedDpr;
      return next;
    });
  }, [debouncedDpr]);

  // Called when the standby slot finishes rendering.
  // Only promotes the slot if its DPR is still the current target
  // (ignores renders that were superseded by a faster zoom).
  const handleStandbyRender = useCallback((slot: 0 | 1, dpr: number) => {
    if (dpr === pendingDprRef.current) {
      setActiveSlot(slot);
    }
  }, []);

  return (
    <div style={{ position: "relative", lineHeight: 0 }}>
      {([0, 1] as const).map((slot) => {
        const isActive = slot === activeSlot;
        const dpr = slotDprs[slot];
        return (
          <div
            key={slot}
            style={
              isActive
                ? undefined
                : {
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    pointerEvents: "none",
                    // zIndex -1 keeps the standby canvas below the active one
                    // without using visibility:hidden (which stops canvas paint
                    // in some browsers before the render completes).
                    zIndex: -1,
                  }
            }
          >
            <Page
              pageNumber={pageNumber}
              devicePixelRatio={dpr}
              width={width}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              onRenderSuccess={
                isActive ? undefined : () => handleStandbyRender(slot, dpr)
              }
            />
          </div>
        );
      })}
    </div>
  );
}

type ProjectPdfGalleryProps = {
  items: NonNullable<SanityProject["pdfGallery"]>;
  projectTitle: string;
};

export default function ProjectPdfGallery({
  items,
  projectTitle,
}: ProjectPdfGalleryProps) {
  const [activePages, setActivePages] = useState<Record<string, number>>({});
  const [zoomLevels, setZoomLevels] = useState<Record<string, number>>({});
  const baseDevicePixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  return (
    <div className="project-pdf-gallery">
      {items.map((item, index) => {
        const pdfUrl = getProjectPdfUrl(item);
        if (!pdfUrl) return null;

        const itemKey = `${projectTitle}-pdf-${index}`;
        const currentPage = activePages[itemKey] ?? 1;
        const currentZoom = zoomLevels[itemKey] ?? 1;

        // Scale DPR with zoom to keep canvas pixels matching screen pixels.
        // baseDevicePixelRatio handles retina sharpness at zoom=1.
        // Beyond that each whole zoom step bumps the DPR, capped at MAX_DPR
        // to prevent OOM (at MAX_DPR=6 two slots ≈ 328 MB, safe on desktop).
        const zoomLod = Math.ceil(Math.max(1, currentZoom)); // 1,2,3,4…
        const targetDpr = Math.min(MAX_DPR, baseDevicePixelRatio * zoomLod);

        return (
          <section key={itemKey} className="project-pdf-card">
            <TransformWrapper
              minScale={0.8}
              maxScale={16}
              initialScale={1}
              doubleClick={{ disabled: true }}
              onTransformed={(_, state) => {
                setZoomLevels((prev) => {
                  const nextZoom = Number(state.scale.toFixed(2));
                  if (prev[itemKey] === nextZoom) return prev;
                  return { ...prev, [itemKey]: nextZoom };
                });
              }}
            >
              {() => (
                <TransformComponent wrapperClass="project-pdf-transform">
                  <Document
                    file={pdfUrl}
                    loading={
                      <div className="project-pdf-state">Loading PDF...</div>
                    }
                    error={
                      <div className="project-pdf-state">
                        Unable to render this PDF.
                      </div>
                    }
                    onLoadSuccess={({ numPages }) => {
                      setActivePages((prev) => ({
                        ...prev,
                        [itemKey]: Math.min(prev[itemKey] ?? 1, numPages),
                      }));
                    }}
                  >
                    {/* key=currentPage resets the A/B slots on page navigation
                        so the old-page canvas never flashes through */}
                    <PdfLodPage
                      key={currentPage}
                      pageNumber={currentPage}
                      targetDpr={targetDpr}
                      width={900}
                    />
                  </Document>
                </TransformComponent>
              )}
            </TransformWrapper>
          </section>
        );
      })}
    </div>
  );
}
