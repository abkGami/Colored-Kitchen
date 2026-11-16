/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 removed the `eslint` config key (and `next lint`). Lint via `npm run lint`.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pin the workspace root: a stray C:\Users\USER\package-lock.json otherwise
  // makes Next infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  outputFileTracingRoot: import.meta.dirname,
  // Product photos are uploaded through a Server Action. The action accepts up
  // to 8 images of 10 MB each, so the request body has to allow the whole
  // multipart payload plus its headers, not just one camera image.
  experimental: {
    serverActions: {
      bodySizeLimit: "90mb",
    },
  },
  images: {
    // Next 16 requires any non-default `quality` used by <Image /> to be listed.
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
