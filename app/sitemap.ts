import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /sitemap.xml (2026-11-23): 검색엔진에 알려줄 공개 페이지 목록
 * 페이지를 새로 만들면 여기에도 추가해 주세요. 고객 전용(/mypage)은 넣지 않아요
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-11-23");
  return [
    { url: `${SITE_URL}/`, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reviews`, lastModified: updated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.2 },
  ];
}
