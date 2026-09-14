//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.CONTAINER_BUILD === 'true' ? { output: 'standalone' } : {}),
  outputFileTracingRoot: require('node:path').join(__dirname, '../../..'),
};

module.exports = nextConfig;
