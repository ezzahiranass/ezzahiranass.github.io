"use client";

import dynamic from "next/dynamic";
import type { SanityProject } from "../../lib/sanity";

const ProjectPdfGallery = dynamic(() => import("./ProjectPdfGallery"), {
  ssr: false,
});

type ProjectPdfGalleryShellProps = {
  items: NonNullable<SanityProject["pdfGallery"]>;
  projectTitle: string;
};

export default function ProjectPdfGalleryShell({
  items,
  projectTitle,
}: ProjectPdfGalleryShellProps) {
  return <ProjectPdfGallery items={items} projectTitle={projectTitle} />;
}
