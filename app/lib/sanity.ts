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
  projectType?: ProjectTaxonomyOption;
  projectSubtypes?: ProjectTaxonomyOption[];
  slug?: {
    current?: string;
  };
  summary?: string;
  description?: string;
  client?: ProjectTaxonomyOption;
  role?: ProjectTaxonomyOption;
  techStack?: ProjectTaxonomyOption[];
  skills?: ProjectTaxonomyOption[];
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
    deliverableType?: ProjectTaxonomyOption[];
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
    deliverableType?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
    };
  }>;
  videoGallery?: Array<{
    title?: string;
    caption?: string;
    deliverableType?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
      originalFilename?: string;
      mimeType?: string;
    };
  }>;
  pdfGallery?: Array<{
    title?: string;
    caption?: string;
    deliverableType?: ProjectTaxonomyOption[];
    asset?: {
      url?: string;
      originalFilename?: string;
    };
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
      techStack[]{
        _type == "reference" => @->{
          title,
          slug
        },
        _type != "reference" => {
          "title": @
        }
      },
      skills[]{
        _type == "reference" => @->{
          title,
          slug
        },
        _type != "reference" => {
          "title": @
        }
      },
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
        deliverableType[]{
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
        deliverableType[]{
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
        deliverableType[]{
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
        deliverableType[]{
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
