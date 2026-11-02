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
export type Review = {
  concept: ConceptId;
  /** 원문에서 고른 한 문장 (이모지만 빼고 그대로) */
  text: string;
  /** 방문일 */
  date?: string;
  /** 네이버 '이런 점이 좋았어요' 키워드 */
  tags?: string[];
};

export const REVIEWS: Review[] = [
  {
    concept: "basic-color",
    text: "서로 어떤 자세를 취해도 부끄럽지 않고 여러 번 마음껏 찍을 수 있어서 너무 좋았어요.",
    date: "10.27 방문",
    tags: ["친절해요", "분위기가 편안해요"],
  },
  {
    concept: "basic-color",
    text: "시설도 깨끗하고, 주차도 편하고 친절하셔서 자주 이용하려구요!",
    date: "10.31 방문",
    tags: ["소품이 다양해요", "아이와 가기 좋아요"],
  },
];
