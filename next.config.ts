import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repoName.endsWith(".github.io");
const basePath =
  isGithubPages && repoName && !isUserOrOrgSite ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    // Static export can't use Next's optimizer, so Sanity images are resized by
    // Sanity's own CDN through this loader (local files pass through untouched).
    loader: "custom",
    loaderFile: "./app/lib/sanityImageLoader.ts",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
