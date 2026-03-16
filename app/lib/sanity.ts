export type ProjectLink = {
  label: string;
  kind: string;
  url: string;
};

export type ProjectTaxonomyOption = {
  title?: string | Record<string, unknown>;
  slug?: {
    current?: string;
  };
};

export type SanityProject = {
  title: string;
  subtitle?: string;
  featured?: boolean;
  projectType?: ProjectTaxonomyOption;
  projectSubtypes?: ProjectTaxonomyOption[];
  slug?: {
    current?: string;
  };
  summary?: string;
  description?: string;
  client?: ProjectTaxonomyOption;
  role?: ProjectTaxonomyOption;
  publishedAt?: string;
  coverMedia?: {
    image?: {
      asset?: {
        url?: string;
      };
    };
  };
  mediaGallery?: Array<{
    title?: string;
    alt?: string | null;
    caption?: string;
    mediaType?: string;
    skills?: ProjectTaxonomyOption[];
    deliverableType?: ProjectTaxonomyOption[];
    techStack?: ProjectTaxonomyOption[];
    image?: {
      asset?: {
        url?: string;
      };
    };
    qrImage?: {
      asset?: {
        url?: string;
      };
    };
  }>;
  imageGallery?: Array<{
    title?: string;
    caption?: string;
    skills?: ProjectTaxonomyOption[];
    deliverableType?: ProjectTaxonomyOption[];
    techStack?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
    };
  }>;
  videoGallery?: Array<{
    title?: string;
    caption?: string;
    skills?: ProjectTaxonomyOption[];
    deliverableType?: ProjectTaxonomyOption[];
    techStack?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
      originalFilename?: string;
      mimeType?: string;
    };
  }>;
  pdfGallery?: Array<{
    title?: string;
    caption?: string;
    skills?: ProjectTaxonomyOption[];
    deliverableType?: ProjectTaxonomyOption[];
    techStack?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
      originalFilename?: string;
    };
  }>;
  externalLinkGallery?: Array<{
    title?: string;
    caption?: string;
    skills?: ProjectTaxonomyOption[];
    deliverableType?: ProjectTaxonomyOption[];
    techStack?: ProjectTaxonomyOption[];
  }>;
  links?: ProjectLink[] | null;
};

type SanityQueryResponse<T> = {
  result?: T;
};

const SANITY_PROJECT_ID = "dwxmoldx";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "v2025-02-19";

const projectFields = `
      title,
      subtitle,
      featured,
      "projectType": coalesce(
        projectType->{
          title,
          slug
        },
        select(
          defined(projectType) => {
            "title": projectType
          }
        )
      ),
      projectSubtypes[]{
        _type == "reference" => @->{
          title,
          slug
        },
        _type != "reference" => {
          "title": @
        }
      },
      slug,
      summary,
      description,
      "client": coalesce(
        client->{
          title,
          slug
        },
        select(
          defined(client) => {
            "title": client
          }
        )
      ),
      "role": coalesce(
        role->{
          title,
          slug
        },
        select(
          defined(role) => {
            "title": role
          }
        ),
        roles[0]->{
          title,
          slug
        },
        select(
          defined(roles[0]) => {
            "title": roles[0]
          }
        )
      ),
      publishedAt,
      coverMedia{
        image{
          asset->{url}
        }
      },
      mediaGallery[]{
        title,
        alt,
        caption,
        mediaType,
        skills[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        deliverableType[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        techStack[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        image{
          asset->{url}
        },
        qrImage{
          asset->{url}
        }
      },
      imageGallery[]{
        title,
        caption,
        skills[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        deliverableType[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        techStack[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        asset->{url}
      },
      videoGallery[]{
        title,
        caption,
        skills[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        deliverableType[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        techStack[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        asset->{
          url,
          originalFilename,
          mimeType
        }
      },
      pdfGallery[]{
        title,
        caption,
        skills[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        deliverableType[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        techStack[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        asset->{
          url,
          originalFilename
        }
      },
      externalLinkGallery[]{
        title,
        caption,
        skills[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        deliverableType[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        },
        techStack[]{
          _type == "reference" => @->{
            title,
            slug
          },
          _type != "reference" => {
            "title": @
          }
        }
      },
      links
`;

const projectsQuery = `
  *[_type == "project"]
    | order(coalesce(publishedAt, _createdAt) desc) {
${projectFields}
    }
`;

const projectSlugsQuery = `
  *[_type == "project" && defined(slug.current)].slug.current
`;

async function runSanityQuery<T>(query: string, signal?: AbortSignal) {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`,
    {
      method: "GET",
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Sanity request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SanityQueryResponse<T>;
  return data.result;
}

export async function fetchSanityProjects(signal?: AbortSignal) {
  const result = await runSanityQuery<SanityProject[]>(projectsQuery, signal);
  return result ?? [];
}

export async function fetchSanityProjectBySlug(
  slug: string,
  signal?: AbortSignal
) {
  const query = `
    *[_type == "project" && slug.current == "${slug}"][0] {
${projectFields}
    }
  `;

  const result = await runSanityQuery<SanityProject | null>(query, signal);
  return result ?? null;
}

export async function fetchSanityProjectSlugs(signal?: AbortSignal) {
  const result = await runSanityQuery<string[]>(projectSlugsQuery, signal);
  return result ?? [];
}

export type GalleryImage = { url: string; projectTitle: string };

const galleryImagesQuery = `
  *[_type == "project"] {
    title,
    "imageGalleryUrls": imageGallery[].asset->url,
    "mediaGalleryUrls": mediaGallery[mediaType == "image"].image.asset->url
  }
`;

export async function fetchSanityGalleryImages(limit = 30): Promise<GalleryImage[]> {
  const result = await runSanityQuery<
    Array<{ title: string; imageGalleryUrls?: (string | null)[]; mediaGalleryUrls?: (string | null)[] }>
  >(galleryImagesQuery);

  // Build per-project URL buckets
  const buckets: Array<{ title: string; urls: string[] }> = (result ?? [])
    .map((row) => ({
      title: row.title,
      urls: [
        ...(row.imageGalleryUrls ?? []),
        ...(row.mediaGalleryUrls ?? []),
      ].filter((u): u is string => Boolean(u)),
    }))
    .filter((b) => b.urls.length > 0);

  // Round-robin: pick one from each project in turn until limit reached
  const all: GalleryImage[] = [];
  let round = 0;
  while (all.length < limit) {
    let added = false;
    for (const bucket of buckets) {
      if (round < bucket.urls.length) {
        all.push({ url: bucket.urls[round], projectTitle: bucket.title });
        added = true;
        if (all.length >= limit) break;
      }
    }
    if (!added) break; // all buckets exhausted
    round++;
  }
  return all;
}

export const getProjectCoverUrl = (project: SanityProject) =>
  project.coverMedia?.image?.asset?.url ?? null;

export const getProjectMediaUrl = (
  media?: NonNullable<SanityProject["mediaGallery"]>[number]
) =>
  media?.image?.asset?.url ?? media?.qrImage?.asset?.url ?? null;

export const getProjectImageGalleryUrl = (
  media?: NonNullable<SanityProject["imageGallery"]>[number]
) => media?.asset?.url ?? null;

export const getProjectVideoUrl = (
  media?: NonNullable<SanityProject["videoGallery"]>[number]
) => media?.asset?.url ?? null;

export const getProjectPdfUrl = (
  media?: NonNullable<SanityProject["pdfGallery"]>[number]
) => media?.asset?.url ?? null;

export const formatProjectDate = (value?: string) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  }).format(date);
};

export const getProjectTaxonomyTitle = (
  value?: ProjectTaxonomyOption | string | null
) => {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (typeof value.title === "string") {
    return value.title;
  }

  return null;
};
