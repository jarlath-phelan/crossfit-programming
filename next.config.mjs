/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app is local-first and offline-capable; keep server features minimal for now.
  // Deployed on Vercel (full Next.js runtime) — no static export needed.
};

export default nextConfig;
