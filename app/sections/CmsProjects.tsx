"use client";

import { useEffect, useRef, useState } from "react";
import ProjectCard from "../components/projects/ProjectCard";
import { fetchSanityProjects, type SanityProject } from "../lib/sanity";

export default function CmsProjects() {
  const [projects, setProjects] = useState<SanityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const orderedProjects = [
    ...projects.filter((project) => project.featured),
    ...projects.filter((project) => !project.featured),
  ];
  const featuredProjects = orderedProjects.filter((project) => project.featured);
  const visibleProjects =
    showAll || featuredProjects.length === 0 ? orderedProjects : featuredProjects;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchSanityProjects(controller.signal)
      .then((result) => {
        setProjects(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load projects from Sanity.";
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section
      id="projects"
      className="section section--alt"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Projects</p>
            <h2 className="title">Design & Computation Project Catalog</h2>
          </div>
          <p className="subtitle">Hover a tile to reveal the essentials.</p>
        </div>

        {loading ? (
          <div className="projects-state">Loading projects...</div>
        ) : null}

        {!loading && error ? <div className="projects-state">{error}</div> : null}

        {!loading && !error && projects.length === 0 ? (
          <div className="projects-state">
            No project documents are publicly available yet.
          </div>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <>
            <div className="projects-feed">
              {visibleProjects.map((project, index) => (
                <div
                  key={project.slug?.current ?? project.title}
                  className={`projects-feed__item ${
                    isVisible ? "projects-feed__item--visible" : ""
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
            {featuredProjects.length > 0 && featuredProjects.length < projects.length ? (
              <button
                className="projects-feed__toggle mono"
                onClick={() => setShowAll((prev) => !prev)}
                type="button"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
