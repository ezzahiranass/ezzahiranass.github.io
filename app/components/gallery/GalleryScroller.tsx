import type { CSSProperties } from "react";
import type { GalleryImage } from "../../lib/sanity";
import { sanityImageUrl } from "../../lib/sanityImage";

// Cards are ~280px wide at 4:3 (see .gallery-card); request 1x and 2x crops
// instead of the full-resolution originals (up to 40 MB each, GIFs up to 20 MB).
const CARD_W = 300;
const CARD_H = 225;

export default function GalleryScroller({
  direction = "forward",
  items,
}: {
  direction?: "forward" | "reverse";
  items: GalleryImage[];
}) {
  if (items.length === 0) return null;

  const duration = `${Math.max(items.length * 5, 26)}s`;
  const trackStyle = {
    "--gallery-duration": duration,
  } as CSSProperties;

  const renderItems = (isClone = false) =>
    items.map((item, index) => {
      const src1x = sanityImageUrl(item.url, { width: CARD_W, height: CARD_H, quality: 65 });
      const src2x = sanityImageUrl(item.url, { width: CARD_W * 2, height: CARD_H * 2, quality: 60 });
      return (
        <div
          key={`${isClone ? "clone" : "base"}-${item.url}-${index}`}
          className="gallery-card"
        >
          <div className="gallery-media">
            <img
              src={src1x}
              srcSet={`${src1x} 1x, ${src2x} 2x`}
              alt={isClone ? "" : item.projectTitle}
              width={CARD_W}
              height={CARD_H}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      );
    });

  return (
    <div className="gallery-scroller">
      <div
        className={`gallery-track ${
          direction === "reverse" ? "gallery-track--reverse" : ""
        }`}
        style={trackStyle}
      >
        <div className="gallery-track__segment">{renderItems()}</div>
        <div className="gallery-track__segment" aria-hidden="true">
          {renderItems(true)}
        </div>
      </div>
    </div>
  );
}
