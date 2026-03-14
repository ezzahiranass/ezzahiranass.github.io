"use client";

import { useEffect, useRef, useState } from "react";

type Link = { url: string; label: string };

type Props = {
  clientTitle: string | null;
  roleTitle: string | null;
  publishedAt: string | null;
  projectSubtypeTitles: string[];
  stackTitles: string[];
  skillTitles: string[];
  description?: string | null;
  links?: Link[];
};

const PAGES = ["Info", "Overview"] as const;
const AUTO_FLIP_MS = 3000;

export default function ProjectHeroTabs({
  clientTitle,
  roleTitle,
  publishedAt,
  projectSubtypeTitles,
  stackTitles,
  skillTitles,
  description,
  links,
}: Props) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-flip
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % PAGES.length);
    }, AUTO_FLIP_MS);
    return () => clearInterval(timer);
  }, [paused]);

  // Clean up resume timer on unmount
  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const handleMouseEnter = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setPaused(true);
  };

  const handleMouseLeave = () => {
    resumeTimer.current = setTimeout(() => setPaused(false), AUTO_FLIP_MS);
  };

  const goTo = (i: number) => setPage(i);

  return (
    <div className="hero-tabs" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Both panels always rendered in the same grid cell — container height = tallest panel */}
      <div className="hero-tabs__panels">

        {/* Panel 0: Info */}
        <div className={`hero-tabs__panel${page !== 0 ? " hero-tabs__panel--hidden" : ""}`}>
          <div className="project-hero__meta">
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Client</span>
              <span className="project-hero__meta-value">{clientTitle ?? "—"}</span>
            </div>
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Role</span>
              <span className="project-hero__meta-value">{roleTitle ?? "—"}</span>
            </div>
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Year</span>
              <span className="project-hero__meta-value">{publishedAt ?? "—"}</span>
            </div>
          </div>
          <div className="project-hero__tags">
            <div className="project-hero__tag-row">
              <span className="project-hero__tag-label">Focus</span>
              <span className="project-hero__tag-list">{projectSubtypeTitles.join(" · ") || "—"}</span>
            </div>
            <div className="project-hero__tag-row">
              <span className="project-hero__tag-label">Stack</span>
              <span className="project-hero__tag-list">{stackTitles.join(" · ") || "—"}</span>
            </div>
            <div className="project-hero__tag-row">
              <span className="project-hero__tag-label">Skills</span>
              <span className="project-hero__tag-list">{skillTitles.join(" · ") || "—"}</span>
            </div>
          </div>
        </div>

        {/* Panel 1: Overview */}
        <div className={`hero-tabs__panel${page !== 1 ? " hero-tabs__panel--hidden" : ""}`}>
          <div className="hero-tabs__overview">
            {description ? (
              <p className="hero-tabs__description">{description}</p>
            ) : (
              <p className="hero-tabs__description hero-tabs__description--empty">No description yet.</p>
            )}
            {links?.length ? (
              <div className="hero-tabs__links">
                {links.map((link) => (
                  <a key={link.url} className="btn" href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Dot pagination */}
      <div className="hero-tabs__dots">
        {PAGES.map((label, i) => (
          <button
            key={label}
            className={`hero-tabs__dot${i === page ? " hero-tabs__dot--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={label}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}
