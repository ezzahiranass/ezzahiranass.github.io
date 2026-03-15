import GalleryScroller from "../components/gallery/GalleryScroller";
import TaxonomySearch from "../components/search/TaxonomySearch";
import { fetchSanityGalleryImages, fetchSanityProjects } from "../lib/sanity";

export default async function Gallery() {
  const [items, projects] = await Promise.all([
    fetchSanityGalleryImages(36),
    fetchSanityProjects(),
  ]);

  const rowSize = Math.max(1, Math.ceil(items.length / 3));
  const firstRow = items.slice(0, rowSize);
  const secondRow = items.slice(rowSize, rowSize * 2);
  const thirdRow = items.slice(rowSize * 2);

  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="section-heading gallery-section__heading">
          <div>
            <p className="eyebrow mono">Gallery</p>
            <h2 className="title">Architectural frames and studies.</h2>
          </div>
          <div className="gallery-section__toolbar">
            <p className="subtitle">
              A continuous field of renders, interior studies, and site analysis,
              with search folded into the same section.
            </p>
            <TaxonomySearch initialProjects={projects} />
          </div>
        </div>
      </div>
      <div className="gallery-rows">
        <GalleryScroller items={firstRow} />
        <GalleryScroller direction="reverse" items={secondRow} />
        <GalleryScroller items={thirdRow} />
      </div>
    </section>
  );
}
