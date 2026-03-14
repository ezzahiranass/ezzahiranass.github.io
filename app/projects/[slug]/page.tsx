import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectGallery, { type GalleryItem } from "../../components/projects/ProjectGallery";
import ProjectHeroTabs from "../../components/projects/ProjectHeroTabs";
import {
  fetchSanityProjectBySlug,
  fetchSanityProjectSlugs,
  formatProjectDate,
  getProjectCoverUrl,
  getProjectImageGalleryUrl,
  getProjectMediaUrl,
  getProjectTaxonomyTitle,
  getProjectVideoUrl,
} from "../../lib/sanity";


type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await fetchSanityProjectSlugs();
  return slugs
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await fetchSanityProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const coverUrl = getProjectCoverUrl(project);
  const publishedAt = formatProjectDate(project.publishedAt);
  const clientTitle = getProjectTaxonomyTitle(project.client);
  const projectTypeTitle = getProjectTaxonomyTitle(project.projectType);
  const projectSubtypeTitles =
    project.projectSubtypes?.flatMap((item) => {
      const title = getProjectTaxonomyTitle(item);
      return title ? [title] : [];
    }) ?? [];
  const legacyGalleryItems =
    project.mediaGallery?.filter((item) => item.mediaType === "image" && getProjectMediaUrl(item)) ??
    [];
  const imageGalleryItems =
    project.imageGallery?.filter((item) => getProjectImageGalleryUrl(item)) ?? [];
  const videoGalleryItems =
    project.videoGallery?.filter((item) => getProjectVideoUrl(item)) ?? [];
  const roleTitle = getProjectTaxonomyTitle(project.role);
  const stackTitles =
    project.techStack?.flatMap((item) => {
      const title = getProjectTaxonomyTitle(item);
      return title ? [title] : [];
    }) ?? [];
  const skillTitles =
    project.skills?.flatMap((item) => {
      const title = getProjectTaxonomyTitle(item);
      return title ? [title] : [];
    }) ?? [];

  const galleryItems: GalleryItem[] = [
    ...imageGalleryItems.flatMap((item) => {
      const url = getProjectImageGalleryUrl(item);
      return url ? [{ type: "image" as const, url, alt: item.title ?? project.title, caption: item.caption ?? undefined }] : [];
    }),
    ...legacyGalleryItems.flatMap((item) => {
      const url = getProjectMediaUrl(item);
      return url ? [{ type: "image" as const, url, alt: item.alt ?? item.title ?? project.title, caption: item.caption ?? undefined }] : [];
    }),
    ...videoGalleryItems.flatMap((item) => {
      const url = getProjectVideoUrl(item);
      return url ? [{ type: "video" as const, url, mimeType: item.asset?.mimeType ?? undefined }] : [];
    }),
  ];

  return (
    <main className="project-page">

      {/* ── Full-bleed hero: cover image as background, all info overlaid ── */}
      <section className="project-hero">
        <div className="project-hero__bg">
          {coverUrl ? (
            <Image
              className="project-hero__img"
              src={coverUrl}
              alt={`${project.title} cover image`}
              fill
              priority
              sizes="100vw"
            />
          ) : null}
          <div className="project-hero__overlay" />
        </div>

        <Link href="/#projects" className="project-back mono justify-start border">
          ← Back to projects
        </Link>

        <div className="project-hero__content">
          <p className="eyebrow mono project-hero__eyebrow">
            {projectTypeTitle ?? "Project"}
          </p>
          <h1 className="project-hero__title">{project.title}</h1>
          {project.subtitle ? (
            <p className="project-hero__subtitle">{project.subtitle}</p>
          ) : null}
          {project.summary ? (
            <p className="project-hero__lede">{project.summary}</p>
          ) : null}
          <ProjectHeroTabs
            clientTitle={clientTitle}
            roleTitle={roleTitle}
            publishedAt={publishedAt}
            projectSubtypeTitles={projectSubtypeTitles}
            stackTitles={stackTitles}
            skillTitles={skillTitles}
            description={project.description}
            links={project.links ?? undefined}
          />
        </div>
      </section>

      {/* ── Pinterest-style masonry gallery with lightbox ── */}
      {galleryItems.length > 0 ? (
        <ProjectGallery items={galleryItems} />
      ) : null}

    </main>
  );
}
