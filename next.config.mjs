// next.config.mjs
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  // so you can import .mdx directly in the app router
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      // add hosts you need if you embed remote images in MDX
    ],
  },
};

const withMDX = createMDX({
  // remark/rehype plugins if you want extras
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [require('rehype-slug'), require('rehype-autolink-headings')],
  },
});

export default withMDX(nextConfig);