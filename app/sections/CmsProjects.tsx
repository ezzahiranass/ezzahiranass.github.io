"use client";

import { useEffect, useState } from "react";
import ProjectCard from "../components/projects/ProjectCard";
import { fetchSanityProjects, type SanityProject } from "../lib/sanity";

export default function CmsProjects() {
  const [projects, setProjects] = useState<SanityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <section id="projects" className="section section--alt">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">CMS Projects</p>
            <h2 className="title">A grid of live projects from Sanity.</h2>
          </div>
          <p className="subtitle">Hover a tile to reveal the essentials.</p>
        </div>

        {loading ? (
          <div className="projects-state">Loading projects from Sanity...</div>
        ) : null}

        {!loading && error ? <div className="projects-state">{error}</div> : null}

        {!loading && !error && projects.length === 0 ? (
          <div className="projects-state">
            No project documents are publicly available in Sanity yet.
          </div>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <div className="projects-feed">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug?.current ?? project.title}
                project={project}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
