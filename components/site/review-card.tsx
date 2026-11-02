import { findConcept } from "@/lib/concepts";
import { NAVER_REVIEW_URL, type Review, type ReviewGroup } from "@/lib/reviews";

/**
 * 리뷰 카드. review 가 있으면 리뷰 문장, 없으면 컨셉별 자리 표시 문구
 * compact: REVIEW 마키용 좁은 카드
 */
export function ReviewCard({ group, review, compact }: { group?: ReviewGroup; review?: Review; compact?: boolean }) {
  const name = review ? (findConcept(review.concept)?.name ?? "") : (group?.name ?? "");
  return (
    <a
      className={`rcard${compact ? " rcard-compact" : ""}`}
      href={NAVER_REVIEW_URL}
      target="_blank"
      rel="noopener"
      aria-label={`${name} 리뷰 네이버에서 보기`}
    >
      <span className="stars">★★★★★{group ? ` ${group.score}` : ""}</span>
      {review ? (
        <q>{review.text}</q>
      ) : (
        <q className="ph-q">리뷰 핵심 문장이 들어갈 자리예요. 네이버 리뷰 캡처를 받으면 채워요.</q>
      )}
      <span className="meta">
        <span>{name}</span>
        <span>{review?.date ?? "네이버 원문 ↗"}</span>
      </span>
    </a>
  );
}
