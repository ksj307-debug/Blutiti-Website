import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt (2026-11-23)
 * - 검색엔진이 모든 공개 페이지를 읽게 하고, 고객 전용·서버 주소는 빼요
 * - 고객 전용 화면(/mypage)은 페이지 안에서도 noindex
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/mypage", "/login", "/my-booking"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
