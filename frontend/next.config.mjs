/** @type {import('next').NextConfig} */
const nextConfig = {
  cleanDistDir: false,
  async redirects() {
    return [
      {
        source: "/references",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/demo",
        destination: "/insights",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
