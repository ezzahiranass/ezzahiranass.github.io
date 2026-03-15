"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { fetchSanityProjects, type SanityProject } from "../../lib/sanity";
import {
  collectTaxonomyResults,
  createSearchHref,
  filterTaxonomyResults,
  type TaxonomySearchResult,
} from "../../lib/taxonomy-search";

type TaxonomySearchProps = {
  className?: string;
  collapsible?: boolean;
  initialExpanded?: boolean;
  initialProjects?: SanityProject[];
  initialQuery?: string;
  placeholder?: string;
  variant?: "default" | "hero";
};

function formatResultProjects(result: TaxonomySearchResult) {
  const projectTitles = result.projects.map((project) => project.title);
  if (projectTitles.length <= 3) {
    return projectTitles.join(", ");
  }

  return `${projectTitles.slice(0, 3).join(", ")} +${
    projectTitles.length - 3
  } more`;
}

export default function TaxonomySearch({
  className,
  collapsible = true,
  initialExpanded = false,
  initialProjects,
  initialQuery = "",
  placeholder = "Search skills, roles, tech stacks...",
  variant = "default",
}: TaxonomySearchProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [fetchedProjects, setFetchedProjects] = useState<SanityProject[]>([]);
  const [searchOpen, setSearchOpen] = useState(
    initialExpanded || !collapsible || Boolean(initialQuery)
  );
  const [resultsOpen, setResultsOpen] = useState(false);
  const projects = initialProjects ?? fetchedProjects;

  useEffect(() => {
    if (typeof initialProjects !== "undefined") return;

    const controller = new AbortController();

    fetchSanityProjects(controller.signal)
      .then((result) => {
        setFetchedProjects(result);
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [initialProjects]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapperRef.current?.contains(target)) return;
      setResultsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const searchIndex = useMemo(() => collectTaxonomyResults(projects), [projects]);
  const filteredResults = useMemo(
    () => filterTaxonomyResults(searchIndex, query),
    [query, searchIndex]
  );

  const showResults = resultsOpen && query.trim().length > 0;

  const openSearch = () => {
    setSearchOpen(true);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleClear = () => {
    if (query) {
      setQuery("");
      inputRef.current?.focus();
      return;
    }

    setResultsOpen(false);

    if (collapsible) {
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      handleClear();
      return;
    }

    if (event.key !== "Enter") return;

    const firstResult = filteredResults[0];
    if (!firstResult) return;

    event.preventDefault();
    setResultsOpen(false);
    router.push(createSearchHref(firstResult.category, firstResult.value));
  };

  return (
    <div
      ref={wrapperRef}
      className={[
        "taxonomy-search",
        `taxonomy-search--${variant}`,
        searchOpen ? "is-open" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!searchOpen ? (
        <button
          aria-label="Search skills and project taxonomy"
          className="taxonomy-search__toggle"
          onClick={openSearch}
          type="button"
        >
          <Search size={18} />
        </button>
      ) : null}

      <div className="taxonomy-search__field">
        <Search aria-hidden="true" size={16} />
        <input
          ref={inputRef}
          aria-label="Search skills, roles, project types, subtypes, and tech stacks"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setResultsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        {!query ? (
          <button
            aria-label="Close search"
            className="taxonomy-search__clear"
            onClick={handleClear}
            type="button"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {showResults ? (
        <div className="taxonomy-search-results">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Link
                key={result.key}
                className="taxonomy-search-result"
                href={createSearchHref(result.category, result.value)}
                onClick={() => setResultsOpen(false)}
              >
                <div className="taxonomy-search-result__title mono">
                  {result.category} &gt; {result.value}
                </div>
                <div className="taxonomy-search-result__meta">
                  Found in: {formatResultProjects(result)}
                </div>
              </Link>
            ))
          ) : (
            <div className="taxonomy-search-results__empty">
              No taxonomy matches found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
