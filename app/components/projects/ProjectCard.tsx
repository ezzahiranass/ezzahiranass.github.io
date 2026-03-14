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
  const projectTypeTitle = getProjectTaxonomyTitle(project.projectType);
  const href = project.slug?.current ? `/projects/${project.slug.current}` : "#projects";

  return (
    <Link href={href} className="project-card">
      <article className="project-tile">
        {coverUrl ? (
          <div className="project-tile__media">
            <Image
              src={coverUrl}
              alt={`${project.title} cover image`}
              width={1200}
              height={1200}
            />
          </div>
        ) : (
          <div className="project-tile__media project-tile__media--placeholder">
            <span className="mono project-tile__placeholder">No cover image</span>
          </div>
        )}

        <div className="project-tile__overlay">
          <div className="project-tile__meta">
            {projectTypeTitle ? (
              <span className="project-tile__badge mono">{projectTypeTitle}</span>
            ) : null}
            {publishedAt ? (
              <span className="project-tile__date mono">{publishedAt}</span>
            ) : null}
          </div>
          <h3 className="project-tile__title">{project.title}</h3>
        </div>
      </article>
    </Link>
  );
}
