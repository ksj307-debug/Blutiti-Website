import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 개발 중 같은 Wi-Fi 의 휴대폰에서 http://<PC IP>:3000 으로 볼 수 있게 (개발 서버 전용, 배포에는 영향 없음)
  allowedDevOrigins: ["192.168.*.*"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
