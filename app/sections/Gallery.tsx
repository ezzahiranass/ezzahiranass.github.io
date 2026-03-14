import GalleryScroller from "../components/gallery/GalleryScroller";
import { fetchSanityGalleryImages } from "../lib/sanity";

export default async function Gallery() {
  const items = await fetchSanityGalleryImages(30);

  return (
    <section id="gallery" className="section section--alt">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Gallery</p>
            <h2 className="title">Architectural frames and studies.</h2>
          </div>
          <p className="subtitle">
            A continuous ribbon of renders, interior studies, and site analysis.
          </p>
        </div>
      </div>
      <GalleryScroller items={items} />
    </section>
  );
}
