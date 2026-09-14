//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.CONTAINER_BUILD === 'true' ? { output: 'standalone' } : {}),
  outputFileTracingRoot: require('node:path').join(__dirname, '../../..'),
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/sharp/**/*.*',
      '../../../node_modules/.pnpm/sharp@*/node_modules/**/*.*',
      '../../../node_modules/.pnpm/@img+colour@*/node_modules/**/*.*',
      '../../../node_modules/.pnpm/@img+sharp-linuxmusl-*@*/node_modules/**/*.*',
      '../../../node_modules/.pnpm/@img+sharp-libvips-linuxmusl-*@*/node_modules/**/*.*',
      '../../../node_modules/.pnpm/detect-libc@*/node_modules/**/*.*',
      '../../../node_modules/.pnpm/semver@7.8.5/node_modules/**/*.*',
    ],
  },
};

module.exports = nextConfig;
