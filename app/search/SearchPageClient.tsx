"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProjectGallery from "../components/projects/ProjectGallery";
import ProjectCard from "../components/projects/ProjectCard";
import TaxonomySearch from "../components/search/TaxonomySearch";
import { type SanityProject } from "../lib/sanity";
import {
  collectSearchMediaItems,
  collectSearchMediaItemsForResult,
  collectTaxonomyResults,
  getProjectsForTaxonomyResult,
  type SearchMediaItem,
  resolveTaxonomyResult,
} from "../lib/taxonomy-search";

function buildSummary(projectTitles: string[], mediaCount: number) {
  if (projectTitles.length === 0) {
    return "Choose a taxonomy result to explore matching work across the archive.";
  }

  const titlePreview =
    projectTitles.length > 3
      ? `${projectTitles.slice(0, 3).join(", ")} and ${
          projectTitles.length - 3
        } more`
      : projectTitles.join(", ");

  return `Found across ${projectTitles.length} project${
    projectTitles.length === 1 ? "" : "s"
  } and ${mediaCount} media item${
    mediaCount === 1 ? "" : "s"
  }, including ${titlePreview}.`;
}

function isMediaDrivenSearch(category?: string | null) {
  return (
    category === "Skill" ||
    category === "Deliverable Type" ||
    category === "Tech Stack"
  );
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickSeededItem<T>(items: T[], seed: string) {
  if (items.length === 0) return null;
  const index = hashString(seed) % items.length;
  return items[index] ?? null;
}

function getBannerImageFromMedia(items: SearchMediaItem[], seed: string) {
  const imageItems = items.filter(
    (item): item is Extract<SearchMediaItem, { type: "image" }> => item.type === "image"
  );
  return pickSeededItem(imageItems, seed)?.url ?? null;
}

function SearchResultsPanel({
  defaultView,
  galleryItems,
  matchingProjects,
}: {
  defaultView: "gallery" | "projects";
  galleryItems: SearchMediaItem[];
  matchingProjects: SanityProject[];
}) {
  const [activeView, setActiveView] = useState<"gallery" | "projects">(
    defaultView
  );

  const activeHeading =
    activeView === "gallery"
      ? {
          eyebrow: "Media Matches",
          title: "Images and videos from those projects.",
          description:
            "Media is pulled from the matching projects for this taxonomy result and shown first for quicker visual scanning.",
        }
      : {
          eyebrow: "Project Matches",
          title: "Projects tied to this taxonomy result.",
          description:
            "These are the project records where this skill, role, type, subtype, or stack entry appears.",
        };

  return (
    <section className="search-page__section search-page__section--results">
      <div className="container">
        <div className="section-heading search-page__heading">
          
          <div className="search-page__toolbar">
            <div
              className="search-page__switch"
              role="tablist"
              aria-label="Search results view"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "gallery"}
                className={`search-page__switch-button ${
                  activeView === "gallery"
                    ? "search-page__switch-button--active"
                    : ""
                }`}
                onClick={() => setActiveView("gallery")}
              >
                Gallery
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "projects"}
                className={`search-page__switch-button ${
                  activeView === "projects"
                    ? "search-page__switch-button--active"
                    : ""
                }`}
                onClick={() => setActiveView("projects")}
              >
                Projects
              </button>
            </div>
            <p className="subtitle search-page__description">
              {activeHeading.description}
            </p>
          </div>
        </div>
      </div>

      {activeView === "gallery" ? (
        galleryItems.length > 0 ? (
          <ProjectGallery items={galleryItems} />
        ) : (
          <section className="search-page__empty">
            <div className="container">
              <h2 className="project-section-heading">No media found yet.</h2>
              <p className="project-article__paragraph">
                The matching projects exist, but they do not currently have any
                image or video assets attached.
              </p>
            </div>
          </section>
        )
      ) : (
        <div className="container">
          {matchingProjects.length > 0 ? (
            <div className="projects-feed">
              {matchingProjects.map((project) => (
                <ProjectCard
                  key={project.slug?.current ?? project.title}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="projects-state">No projects matched this search yet.</div>
          )}
        </div>
      )}
    </section>
  );
}

export default function SearchPageClient({
  projects,
}: {
  projects: SanityProject[];
}) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const value = searchParams.get("value");

  const searchIndex = useMemo(() => collectTaxonomyResults(projects), [projects]);
  const selectedResult = useMemo(
    () => resolveTaxonomyResult(searchIndex, category, value),
    [category, searchIndex, value]
  );
  const matchingProjects = useMemo(
    () => getProjectsForTaxonomyResult(projects, selectedResult),
    [projects, selectedResult]
  );
  const defaultView = isMediaDrivenSearch(selectedResult?.category)
    ? "gallery"
    : "projects";
  const galleryItems = useMemo(
    () => collectSearchMediaItemsForResult(matchingProjects, selectedResult),
    [matchingProjects, selectedResult]
  );
  const bannerImage = useMemo(() => {
    const seed = selectedResult?.key ?? "search-banner";
    if (isMediaDrivenSearch(selectedResult?.category)) {
      return getBannerImageFromMedia(galleryItems, seed);
    }

    const projectMedia = collectSearchMediaItems(matchingProjects);
    return getBannerImageFromMedia(projectMedia, seed);
  }, [galleryItems, matchingProjects, selectedResult]);

  const projectTitles = matchingProjects.map((project) => project.title);
  const heroTitle = selectedResult
    ? `${selectedResult.category} > ${selectedResult.value}`
    : "Search the archive";
  const heroSubtitle = selectedResult
    ? `${selectedResult.projects.length} matching project${
        selectedResult.projects.length === 1 ? "" : "s"
      }`
    : "Skills, roles, tech stacks, project types, and subtypes";
  const heroLede = selectedResult
    ? buildSummary(projectTitles, galleryItems.length)
    : "Pick a result from the search bar to open a focused media view.";

  return (
    <main className="project-page search-page">
      <section className="project-hero search-hero">
        <div className="project-hero__bg">
          {bannerImage ? (
            <Image
              className="project-hero__img"
              src={bannerImage}
              alt={selectedResult ? `${selectedResult.value} results` : "Search"}
              fill
              priority
              sizes="100vw"
            />
          ) : (
            <div className="search-hero__fallback" />
          )}
          <div className="project-hero__overlay" />
        </div>

        <Link href="/#skills" className="project-back mono justify-start border">
          Back to skills
        </Link>

        <div className="project-hero__content search-hero__content">
          <p className="eyebrow mono project-hero__eyebrow">
            {selectedResult?.category ?? "Search"}
          </p>
          <h1 className="project-hero__title">{heroTitle}</h1>
          <p className="project-hero__subtitle">{heroSubtitle}</p>
          <p className="project-hero__lede">{heroLede}</p>

          <div className="project-hero__meta search-hero__meta">
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Category</span>
              <span className="project-hero__meta-value">
                {selectedResult?.category ?? "Select a result"}
              </span>
            </div>
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Projects</span>
              <span className="project-hero__meta-value">
                {matchingProjects.length}
              </span>
            </div>
            <div className="project-hero__meta-item">
              <span className="project-hero__meta-label">Media</span>
              <span className="project-hero__meta-value">{galleryItems.length}</span>
            </div>
          </div>

          <TaxonomySearch
            key={`${selectedResult?.category ?? "search"}:${selectedResult?.value ?? ""}`}
            initialExpanded
            initialProjects={projects}
            initialQuery={selectedResult?.value ?? ""}
            placeholder="Search skills, roles, project types, or stacks..."
            variant="hero"
          />

          {matchingProjects.length > 0 ? (
            <div className="search-hero__projects">
              {matchingProjects.map((project) => (
                <span
                  key={project.slug?.current ?? project.title}
                  className="search-hero__project-pill mono"
                >
                  {project.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {selectedResult ? (
        <SearchResultsPanel
          key={selectedResult.key}
          defaultView={defaultView}
          galleryItems={galleryItems}
          matchingProjects={matchingProjects}
        />
      ) : (
        <section className="search-page__empty">
          <div className="container">
            <h2 className="project-section-heading">Pick a search result.</h2>
            <p className="project-article__paragraph">
              Use the banner search to choose a taxonomy value and load its
              matching projects and media.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
