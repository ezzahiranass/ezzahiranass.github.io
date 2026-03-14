import Image from "next/image";
import Link from "next/link";
import {
  formatProjectDate,
  getProjectCoverUrl,
  getProjectTaxonomyTitle,
  type SanityProject,
} from "../../lib/sanity";

type ProjectCardProps = {
  project: SanityProject;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const coverUrl = getProjectCoverUrl(project);
  const publishedAt = formatProjectDate(project.publishedAt);
  const clientTitle = getProjectTaxonomyTitle(project.client);
  const projectTypeTitle = getProjectTaxonomyTitle(project.projectType);
  const projectSubtypeTitles =
    project.projectSubtypes?.flatMap((item) => {
      const title = getProjectTaxonomyTitle(item);
      return title ? [title] : [];
    }) ?? [];
  const roleTitle = getProjectTaxonomyTitle(project.role);
  const metaItems = [
    clientTitle ? `Client: ${clientTitle}` : null,
    projectTypeTitle ? `Type: ${projectTypeTitle}` : null,
    projectSubtypeTitles.length > 0 ? `Subtypes: ${projectSubtypeTitles.join(", ")}` : null,
    roleTitle ? `Role: ${roleTitle}` : null,
    project.status ? `Status: ${project.status}` : null,
    publishedAt ? `Published: ${publishedAt}` : null,
  ].filter(Boolean) as string[];
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
  const href = project.slug?.current ? `/projects/${project.slug.current}` : "#projects";

  return (
    <Link href={href} className="project-card">
      <article className="project-post">
        {coverUrl ? (
          <div className="project-post__cover">
            <Image
              src={coverUrl}
              alt={project.coverMedia?.alt ?? `${project.title} cover image`}
              width={1280}
              height={900}
            />
          </div>
        ) : (
          <div className="project-post__cover project-post__cover--placeholder">
            <span className="mono project-post__placeholder">No cover image</span>
          </div>
        )}

        <div className="project-post__body">
          <div className="project-post__header">
            <div>
              <p className="mono project-post__kicker">
                {project.slug?.current ?? "project"}
              </p>
              <h3>{project.title}</h3>
              {project.subtitle ? (
                <p className="project-post__subtitle">{project.subtitle}</p>
              ) : null}
            </div>
            {metaItems.length > 0 ? (
              <div className="pill-row">
                {metaItems.map((item) => (
                  <span key={`${project.title}-${item}`} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {project.summary ? (
            <p className="project-post__summary">{project.summary}</p>
          ) : null}

          {project.description ? (
            <p className="project-post__description">{project.description}</p>
          ) : null}

          {roleTitle ? (
            <div className="project-post__meta-block">
              <span className="mono project-post__label">Role</span>
              <div className="pill-row">
                <span className="pill">{roleTitle}</span>
              </div>
            </div>
          ) : null}

          {projectSubtypeTitles.length > 0 ? (
            <div className="project-post__meta-block">
              <span className="mono project-post__label">Subtypes</span>
              <div className="pill-row">
                {projectSubtypeTitles.map((item) => (
                  <span key={`${project.title}-${item}`} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {stackTitles.length > 0 ? (
            <div className="project-post__meta-block">
              <span className="mono project-post__label">Stack</span>
              <div className="pill-row">
                {stackTitles.map((item) => (
                  <span key={`${project.title}-${item}`} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {skillTitles.length > 0 ? (
            <div className="project-post__meta-block">
              <span className="mono project-post__label">Skills</span>
              <div className="pill-row">
                {skillTitles.map((item) => (
                  <span key={`${project.title}-${item}`} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {project.links?.length ? (
            <div className="project-post__links">
              {project.links.map((link) => (
                <span key={`${project.title}-${link.url}`} className="btn">
                  {link.label}
                </span>
              ))}
            </div>
          ) : null}

          <span className="project-card__cta mono">Open project</span>
        </div>
      </article>
    </Link>
  );
}
