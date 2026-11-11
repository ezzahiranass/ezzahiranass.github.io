const SANITY_IMAGE_HOST = "https://cdn.sanity.io/images/";

type SanityImageOptions = {
  width: number;
  height?: number;
  quality?: number;
  fit?: "max" | "crop" | "clip";
};

export const isSanityImage = (src: string) => src.startsWith(SANITY_IMAGE_HOST);

/**
 * Returns a resized, format-negotiated (WebP/AVIF) URL from Sanity's image CDN.
 * Source assets are full resolution (up to 9933x14043 / 40 MB, GIFs up to 20 MB),
 * so every on-page image must go through this.
 */
export function sanityImageUrl(
  src: string,
  { width, height, quality = 72, fit = "max" }: SanityImageOptions
) {
  if (!isSanityImage(src)) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(Math.round(width)));
  if (height) url.searchParams.set("h", String(Math.round(height)));
  url.searchParams.set("fit", height && fit === "max" ? "crop" : fit);
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", String(quality));
  return url.toString();
}
