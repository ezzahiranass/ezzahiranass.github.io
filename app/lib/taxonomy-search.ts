import {
  getProjectCoverUrl,
  getProjectImageGalleryUrl,
  getProjectMediaUrl,
  getProjectTaxonomyTitle,
  getProjectVideoUrl,
  type SanityProject,
} from "./sanity";

export type SearchCategory =
  | "Skill"
  | "Project Type"
  | "Project Subtype"
  | "Tech Stack"
  | "Role";

export type SearchProjectRef = {
  key: string;
  slug?: string;
  title: string;
};

export type TaxonomySearchResult = {
  key: string;
  category: SearchCategory;
  value: string;
  projects: SearchProjectRef[];
};

export type SearchMediaItem =
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "video"; url: string; mimeType?: string };

export const searchCategoryOrder: SearchCategory[] = [
  "Skill",
  "Project Type",
  "Project Subtype",
  "Tech Stack",
  "Role",
];

export function createSearchHref(category: SearchCategory, value: string) {
  const params = new URLSearchParams({
    category,
    value,
  });

  return `/search?${params.toString()}`;
}

export function getProjectSearchKey(project: SanityProject) {
  const slug = project.slug?.current?.trim();
  if (slug) return slug;
  return project.title.trim();
}

export function normalizeSearchCategory(
  value?: string | null
): SearchCategory | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;

  return (
    searchCategoryOrder.find(
      (category) => category.toLowerCase() === normalized
    ) ?? null
  );
}

export function collectTaxonomyResults(projects: SanityProject[]) {
  const map = new Map<string, TaxonomySearchResult>();

  const pushEntry = (
    category: SearchCategory,
    rawValue: string | null | undefined,
    project: SanityProject
  ) => {
    const value = rawValue?.trim();
    if (!value) return;

    const key = `${category}:${value.toLowerCase()}`;
    const existing = map.get(key);
    const projectRef: SearchProjectRef = {
      key: getProjectSearchKey(project),
      slug: project.slug?.current?.trim() || undefined,
      title: project.title,
    };

    if (existing) {
      if (!existing.projects.some((item) => item.key === projectRef.key)) {
        existing.projects.push(projectRef);
      }
      return;
    }

    map.set(key, {
      key,
      category,
      value,
      projects: [projectRef],
    });
  };

  projects.forEach((project) => {
    pushEntry("Role", getProjectTaxonomyTitle(project.role), project);
    pushEntry(
      "Project Type",
      getProjectTaxonomyTitle(project.projectType),
      project
    );

    project.projectSubtypes?.forEach((item) => {
      pushEntry("Project Subtype", getProjectTaxonomyTitle(item), project);
    });

    project.techStack?.forEach((item) => {
      pushEntry("Tech Stack", getProjectTaxonomyTitle(item), project);
    });

    project.skills?.forEach((item) => {
      pushEntry("Skill", getProjectTaxonomyTitle(item), project);
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const categoryDelta =
      searchCategoryOrder.indexOf(a.category) -
      searchCategoryOrder.indexOf(b.category);

    if (categoryDelta !== 0) return categoryDelta;

    return a.value.localeCompare(b.value);
  });
}

export function filterTaxonomyResults(
  results: TaxonomySearchResult[],
  query: string,
  limit = 8
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return results
    .filter((item) => {
      const searchable = [
        item.category,
        item.value,
        ...item.projects.map((project) => project.title),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalized);
    })
    .slice(0, limit);
}

export function resolveTaxonomyResult(
  results: TaxonomySearchResult[],
  category?: string | null,
  value?: string | null
) {
  const normalizedCategory = normalizeSearchCategory(category);
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedCategory || !normalizedValue) return null;

  return (
    results.find(
      (item) =>
        item.category === normalizedCategory &&
        item.value.toLowerCase() === normalizedValue
    ) ?? null
  );
}

export function getProjectsForTaxonomyResult(
  projects: SanityProject[],
  result: TaxonomySearchResult | null
) {
  if (!result) return [];

  const keys = new Set(result.projects.map((project) => project.key));
  return projects.filter((project) => keys.has(getProjectSearchKey(project)));
}

function buildMediaCaption(projectTitle: string, detail?: string | null) {
  const trimmed = detail?.trim();
  if (!trimmed) return projectTitle;
  return `${projectTitle} - ${trimmed}`;
}

export function collectSearchMediaItems(projects: SanityProject[]) {
  const items: SearchMediaItem[] = [];
  const seen = new Set<string>();

  projects.forEach((project) => {
    project.imageGallery?.forEach((item) => {
      const url = getProjectImageGalleryUrl(item);
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({
        type: "image",
        url,
        alt: item.title ?? project.title,
        caption: buildMediaCaption(project.title, item.caption ?? item.title),
      });
    });

    project.mediaGallery?.forEach((item) => {
      if (item.mediaType !== "image") return;
      const url = getProjectMediaUrl(item);
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({
        type: "image",
        url,
        alt: item.alt ?? item.title ?? project.title,
        caption: buildMediaCaption(project.title, item.caption ?? item.title),
      });
    });

    project.videoGallery?.forEach((item) => {
      const url = getProjectVideoUrl(item);
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({
        type: "video",
        url,
        mimeType: item.asset?.mimeType ?? undefined,
      });
    });
  });

  return items;
}

export function getFirstSearchBannerImage(projects: SanityProject[]) {
  for (const project of projects) {
    const imageGalleryUrl = project.imageGallery
      ?.map((item) => getProjectImageGalleryUrl(item))
      .find((url): url is string => Boolean(url));
    if (imageGalleryUrl) return imageGalleryUrl;

    const mediaGalleryUrl = project.mediaGallery
      ?.filter((item) => item.mediaType === "image")
      .map((item) => getProjectMediaUrl(item))
      .find((url): url is string => Boolean(url));
    if (mediaGalleryUrl) return mediaGalleryUrl;

    const coverUrl = getProjectCoverUrl(project);
    if (coverUrl) return coverUrl;
  }

  return null;
}
