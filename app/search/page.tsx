import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import { fetchSanityProjects } from "../lib/sanity";

export default async function SearchPage() {
  const projects = await fetchSanityProjects();

  return (
    <Suspense fallback={null}>
      <SearchPageClient projects={projects} />
    </Suspense>
  );
}
