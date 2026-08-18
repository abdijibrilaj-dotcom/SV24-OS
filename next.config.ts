import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Document/payout uploads go through Server Actions; Next's default body
  // limit there is 1 MB, which real ID scans and payslip PDFs regularly
  // exceed. Kept in sync with MAX_UPLOAD_BYTES in src/lib/storage.ts.
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
