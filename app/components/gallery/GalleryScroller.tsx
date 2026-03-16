import type { CSSProperties } from "react";
import type { GalleryImage } from "../../lib/sanity";

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
    items.map((item, index) => (
      <div
        key={`${isClone ? "clone" : "base"}-${item.url}-${index}`}
        className="gallery-card"
      >
        <div className="gallery-media">
          <img src={item.url} alt={isClone ? "" : item.projectTitle} loading="lazy" />
        </div>
      </div>
    ));

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
