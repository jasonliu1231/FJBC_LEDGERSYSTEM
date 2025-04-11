/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL_8100: process.env.NODE_ENV === "development" ? "http://172.16.150.31:8100/test_api" : "http://172.16.150.26:8100",
    NEXT_PUBLIC_API_URL_8101: process.env.NODE_ENV === "development" ? "http://172.16.150.31:8101/test_api" : "http://172.16.150.26:8101",
    NEXT_PUBLIC_API_URL_8102: process.env.NODE_ENV === "development" ? "http://172.16.161.118:8102/test_api" : "http://172.16.150.26:8102"
  }
};

export default nextConfig;
