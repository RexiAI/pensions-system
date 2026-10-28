import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    /**
     * With more than one root layout (the public tree has one per locale branch, so each can
     * declare its own `<html lang>`), an unmatched URL has no layout to inherit. This flag
     * makes Next render `app/global-not-found.tsx` instead of a bare, unstyled document.
     */
    globalNotFound: true,
  },
};

export default nextConfig;
