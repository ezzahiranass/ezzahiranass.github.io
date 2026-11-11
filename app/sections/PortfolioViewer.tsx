"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { assetPath } from "../lib/assetPath";
import { useInView } from "../lib/useInView";

// The 3D book (three-stdlib FBXLoader + Book.fbx + page textures) is only fetched
// once the visitor opens the viewer.
const BookViewerCanvas = dynamic(() => import("../components/viewers/BookViewerCanvas"), {
  ssr: false,
  loading: () => <div className="viewer-loading mono">Loading viewer…</div>,
});

const KNOWN_TOTAL_PAGES = 62;

type BookState = "open" | "closed-left" | "closed-right";

export default function PortfolioViewer() {
  const totalPages = KNOWN_TOTAL_PAGES;
  const maxPageIndex = Math.max(Math.ceil(totalPages / 2) - 1, 0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [bookState, setBookState] = useState<BookState>("open");
  const playActionRef = useRef<((actionName: string) => void) | null>(null);
  const [isCameraDefault, setIsCameraDefault] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(viewerRef);

  const handleActionsReady = useCallback((playAction: (actionName: string) => void) => {
    playActionRef.current = playAction;
  }, []);

  const handleNext = () => {
    if (bookState === "closed-right") {
      playActionRef.current?.("Open Book State");
      setBookState("open");
      setCurrentPageIndex(0);
      setResetKey((prev) => prev + 1);
      return;
    }

    if (currentPageIndex < maxPageIndex) {
      setCurrentPageIndex((prev) => prev + 1);
      setResetKey((prev) => prev + 1);
    } else {
      playActionRef.current?.("Close Book State Left");
      setBookState("closed-left");
      setResetKey((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (bookState === "closed-left") {
      playActionRef.current?.("Open Book State");
      setBookState("open");
      setCurrentPageIndex(maxPageIndex);
      setResetKey((prev) => prev + 1);
      return;
    }

    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setResetKey((prev) => prev + 1);
    } else {
      playActionRef.current?.("Close Book State Right");
      setBookState("closed-right");
      setResetKey((prev) => prev + 1);
    }
  };

  const handleSliderChange = (value: number) => {
    if (bookState !== "open") {
      playActionRef.current?.("Open Book State");
      setBookState("open");
    }
    setCurrentPageIndex(value);
    setResetKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = useCallback(async () => {
    const element = viewerRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch {
      // ignore fullscreen errors
    }
  }, []);

  const leftPage = totalPages ? currentPageIndex * 2 + 1 : 0;
  const rightPage = totalPages ? Math.min(currentPageIndex * 2 + 2, totalPages) : 0;

  return (
    <section id="portfolio" className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Portfolio Viewer</p>
            <h2 className="title">Architecture, systems, and prototypes.</h2>
          </div>
          <p className="subtitle">
            Case studies spanning architectural projects, computational research,
            and digital tooling.
          </p>
        </div>
        <div className="viewer">
          <div className="viewer-screen has-viewer viewer-screen--full" ref={viewerRef}>
            <div className="viewer-canvas">
              {isOpen ? (
                <BookViewerCanvas
                  currentPageIndex={currentPageIndex}
                  resetKey={resetKey}
                  active={inView}
                  onActionsReady={handleActionsReady}
                  onDefaultChange={setIsCameraDefault}
                />
              ) : null}
            </div>
            {!isOpen ? (
              <div className="viewer-overlay">
                <div>
                  <p className="mono">Interactive Viewer</p>
                  <h3>Open the Book Viewer</h3>
                  <p className="subtitle">
                    Drag to pan, scroll to zoom, and use the arrows to flip pages.
                  </p>
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => setIsOpen(true)}
                  >
                    Open the Viewer
                  </button>
                </div>
              </div>
            ) : null}
            <button
              className="viewer-control viewer-control--left"
              type="button"
              onClick={handlePrev}
              aria-label="Previous page"
              disabled={bookState === "closed-right"}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="viewer-control viewer-control--right"
              type="button"
              onClick={handleNext}
              aria-label="Next page"
              disabled={bookState === "closed-left"}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <div className="viewer-slider">
              <span className="mono">{leftPage}-{rightPage}</span>
              <input
                className="range-modern"
                type="range"
                min={0}
                max={maxPageIndex}
                value={currentPageIndex}
                onChange={(event) => handleSliderChange(Number(event.target.value))}
              />
              <span className="mono">{totalPages}</span>
            </div>
            {!isCameraDefault ? (
              <button
                className="viewer-reset"
                type="button"
                onClick={() => setResetKey((prev) => prev + 1)}
                aria-label="Reset view"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 5v4h4" />
                </svg>
              </button>
            ) : null}
            <div className="viewer-top-actions">
              <button
                className="viewer-icon"
                type="button"
                onClick={handleToggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H3v5" />
                  <path d="M21 8V3h-5" />
                  <path d="M3 16v5h5" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
              <a
                className="viewer-icon"
                href={assetPath("/Portfolio_EzzahirAnass_2026.pdf")}
                download
                aria-label="Download PDF"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v10" />
                  <path d="M8 9l4 4 4-4" />
                  <path d="M5 21h14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
