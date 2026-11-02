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

/** 네이버 플레이스 방문자 리뷰 (장소 ID 2039948985) — 카드를 누르면 이 주소로 이동 */
export const NAVER_REVIEW_URL = "https://m.place.naver.com/place/2039948985/review/visitor";

/**
 * REVIEW 마키에 보여줄 리뷰 문장
 * - 네이버 방문자 리뷰 원문에서 고객 동의를 받은 핵심 문장만 짧게 (지어내지 않음)
 * - concept 은 lib/concepts.ts id (세이지 포레스트 리뷰는 basic-color)
 * - 비어 있으면 컨셉별 자리 표시 카드를 보여줌
 */
export type Review = { concept: ConceptId; text: string; date?: string };

export const REVIEWS: Review[] = [];
