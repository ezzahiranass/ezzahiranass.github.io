import SearchPageClient from "./SearchPageClient";
import { fetchSanityProjects } from "../lib/sanity";

export default async function SearchPage() {
  const projects = await fetchSanityProjects();

  return <SearchPageClient projects={projects} />;
}
