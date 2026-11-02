import { NAVER_URL, type ReviewGroup } from "@/lib/reviews";

/** 리뷰 카드. 실제 리뷰 문장은 네이버 리뷰 캡처를 받으면 채움 */
export function ReviewCard({ group }: { group: ReviewGroup }) {
  return (
    <a className="rcard" href={NAVER_URL} target="_blank" rel="noopener" aria-label={`${group.name} 리뷰 네이버에서 보기`}>
      <span className="stars">★★★★★ {group.score}</span>
      <q className="ph-q">리뷰 핵심 문장이 들어갈 자리예요. 네이버 리뷰 캡처를 받으면 채워요.</q>
      <span className="meta">
        <span>{group.name}</span>
        <span>네이버 원문 ↗</span>
      </span>
    </a>
  );
}
