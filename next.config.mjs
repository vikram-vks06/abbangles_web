/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/webadmin/v1/:path*",
        destination: "http://127.0.0.1:5000/webadmin/v1/:path*",
      },
      { source: "/webadmin", destination: "/webadmin-app/index.html" },
      { source: "/webadmin/:path*", destination: "/webadmin-app/index.html" },
    ];
  },
};
export default nextConfig;
