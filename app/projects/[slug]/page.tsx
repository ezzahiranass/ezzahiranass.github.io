import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchSanityProjectBySlug,
  fetchSanityProjectSlugs,
  formatProjectDate,
  getProjectCoverUrl,
  getProjectMediaUrl,
  getProjectTaxonomyTitle,
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
  const galleryItems =
    project.mediaGallery?.filter((item) => item.mediaType === "image" && getProjectMediaUrl(item)) ??
    [];
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

  return (
    <main className="project-page">
      <section className="section">
        <article className="container project-article">
          <Link href="/#projects" className="project-back mono">
            Back to projects
          </Link>

          <header className="project-article__header">
            <p className="eyebrow mono">Project Post</p>
            <h1 className="project-article__title">{project.title}</h1>
            {project.subtitle ? (
              <p className="project-article__subtitle">{project.subtitle}</p>
            ) : null}
            {project.summary ? (
              <p className="project-article__lede">{project.summary}</p>
            ) : null}
            <div className="pill-row">
              {clientTitle ? <span className="pill">Client: {clientTitle}</span> : null}
              {projectTypeTitle ? <span className="pill">Type: {projectTypeTitle}</span> : null}
              {projectSubtypeTitles.map((item) => (
                <span key={`${project.title}-${item}`} className="pill">
                  Subtype: {item}
                </span>
              ))}
              {roleTitle ? <span className="pill">Role: {roleTitle}</span> : null}
              {project.status ? <span className="pill">Status: {project.status}</span> : null}
              {publishedAt ? <span className="pill">Published: {publishedAt}</span> : null}
            </div>
          </header>

          <div className="project-article__hero">
            {coverUrl ? (
              <div className="project-article__cover">
                <Image
                  src={coverUrl}
                  alt={project.coverMedia?.alt ?? `${project.title} cover image`}
                  width={1600}
                  height={1125}
                />
              </div>
            ) : (
              <div className="project-article__cover project-post__cover--placeholder">
                <span className="mono project-post__placeholder">No cover image</span>
              </div>
            )}
          </div>

          <div className="project-article__layout">
            <aside className="project-article__sidebar">
              <div className="project-article__meta-card">
                {clientTitle ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Client</span>
                    <p>{clientTitle}</p>
                  </div>
                ) : null}
                {projectTypeTitle ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Type</span>
                    <p>{projectTypeTitle}</p>
                  </div>
                ) : null}
                {projectSubtypeTitles.length > 0 ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Subtypes</span>
                    <p>{projectSubtypeTitles.join(", ")}</p>
                  </div>
                ) : null}
                {publishedAt ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Published</span>
                    <p>{publishedAt}</p>
                  </div>
                ) : null}
                {roleTitle ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Role</span>
                    <p>{roleTitle}</p>
                  </div>
                ) : null}
                {stackTitles.length > 0 ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Stack</span>
                    <p>{stackTitles.join(", ")}</p>
                  </div>
                ) : null}
                {skillTitles.length > 0 ? (
                  <div className="project-article__meta-row">
                    <span className="mono project-post__label">Skills</span>
                    <p>{skillTitles.join(", ")}</p>
                  </div>
                ) : null}
              </div>

              {project.links?.length ? (
                <div className="project-article__links">
                  {project.links.map((link) => (
                    <a
                      key={`${project.title}-${link.url}`}
                      className="btn"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </aside>

            <div className="project-article__body">
              {project.description ? (
                <div className="project-article__section">
                  <h2>Overview</h2>
                  <p className="project-article__paragraph">{project.description}</p>
                </div>
              ) : null}

              {roleTitle || projectSubtypeTitles.length > 0 || stackTitles.length > 0 || skillTitles.length > 0 ? (
                <div className="project-article__section">
                  <h2>Project Notes</h2>
                  {roleTitle ? (
                    <p className="project-article__paragraph">
                      <strong>Role:</strong> {roleTitle}.
                    </p>
                  ) : null}
                  {projectSubtypeTitles.length > 0 ? (
                    <p className="project-article__paragraph">
                      <strong>Subtypes:</strong> {projectSubtypeTitles.join(", ")}.
                    </p>
                  ) : null}
                  {stackTitles.length > 0 ? (
                    <p className="project-article__paragraph">
                      <strong>Tools and stack:</strong> {stackTitles.join(", ")}.
                    </p>
                  ) : null}
                  {skillTitles.length > 0 ? (
                    <p className="project-article__paragraph">
                      <strong>Skills:</strong> {skillTitles.join(", ")}.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {galleryItems.length > 0 ? (
                <div className="project-article__section">
                  <h2>Gallery</h2>
                  <div className="project-gallery project-gallery--article">
                    {galleryItems.map((item, index) => {
                      const mediaUrl = getProjectMediaUrl(item);

                      if (!mediaUrl) {
                        return null;
                      }

                      return (
                        <figure
                          key={`${project.title}-gallery-${index}`}
                          className="project-gallery__item"
                        >
                          <Image
                            src={mediaUrl}
                            alt={item.alt ?? item.title ?? `${project.title} gallery image ${index + 1}`}
                            width={1400}
                            height={1000}
                          />
                          {item.caption ? (
                            <figcaption className="project-gallery__caption">
                              {item.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
