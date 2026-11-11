"use client";

import { useState, type ReactNode } from "react";

type ViewerIntroOverlayProps = {
  eyebrow?: string;
  title: string;
  description: string;
  buttonLabel: string;
  initiallyVisible?: boolean;
  /**
   * Shown behind the overlay instead of `children`. When provided, `children`
   * (e.g. a WebGL viewer) are only mounted after the visitor opens the viewer.
   */
  placeholder?: ReactNode;
  children: ReactNode;
};

export default function ViewerIntroOverlay({
  eyebrow = "Interactive Viewer",
  title,
  description,
  buttonLabel,
  initiallyVisible = true,
  placeholder,
  children,
}: ViewerIntroOverlayProps) {
  const [isVisible, setIsVisible] = useState(initiallyVisible);
  const deferChildren = isVisible && placeholder !== undefined;

  return (
    <div className="viewer-intro">
      {deferChildren ? placeholder : children}
      {isVisible ? (
        <div className="viewer-overlay viewer-intro__overlay">
          <div className="viewer-intro__card">
            <p className="mono viewer-intro__eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
            <p className="subtitle viewer-intro__description">{description}</p>
            <button
              className="btn btn--primary"
              onClick={() => setIsVisible(false)}
              type="button"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
