import { sanityImageUrl } from "./sanityImage";

type LoaderArgs = { src: string; width: number; quality?: number };

// next/image loader for the static export: Sanity URLs are resized on Sanity's CDN,
// anything else (local /public files) is served as-is.
export default function sanityImageLoader({ src, width, quality }: LoaderArgs) {
  return sanityImageUrl(src, { width, quality: quality ?? 75 });
}
