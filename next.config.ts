import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 개발 중 같은 Wi-Fi 의 휴대폰에서 http://<PC IP>:3000 으로 볼 수 있게 (개발 서버 전용, 배포에는 영향 없음)
  allowedDevOrigins: ["192.168.*.*"],
  partialPrefetching: true,
  // 2026-11 웹사이트 자체 예약 중단: 예약 조회 로그인·예약 조회 페이지는 메인으로 (페이지 코드·데이터는 app/login, app/my-booking 에 그대로)
  // permanent: false → 나중에 다시 열 수 있게 임시 이동(307)
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/my-booking", destination: "/", permanent: false },
    ];
  },
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
