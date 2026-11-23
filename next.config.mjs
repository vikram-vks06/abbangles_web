/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/webadmin", destination: "/webadmin-app/index.html" },
      { source: "/webadmin/:path*", destination: "/webadmin-app/index.html" },
    ];
  },
};
export default nextConfig;
