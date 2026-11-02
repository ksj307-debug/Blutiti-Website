import type { ConceptId } from "@/lib/concepts";

/**
 * 네이버 예약 방문자 리뷰 요약 (컨셉별)
 * 세이지 포레스트 리뷰 3개(5.0)는 베이직 컬러에 합산: 17개(4.96) + 3개(5.0) = 20개, 평점 4.97
 */
export const NAVER_URL = "https://naver.me/FuNFFLJA";

export type ReviewGroup = { concept: ConceptId; name: string; score: string; count: number };

export const REVIEW_GROUPS: ReviewGroup[] = [
  { concept: "basic-color", name: "베이직 컬러", score: "4.97", count: 20 },
  { concept: "classic-bw", name: "클래식 흑백", score: "5.0", count: 4 },
  { concept: "100days", name: "100일상", score: "5.0", count: 1 },
  { concept: "id-profile", name: "증명·프로필", score: "5.0", count: 1 },
];

export const REVIEW_TOTAL = REVIEW_GROUPS.reduce((sum, g) => sum + g.count, 0);
