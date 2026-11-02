import Link from "next/link";
import { ReviewCard } from "@/components/site/review-card";
import { NAVER_URL, REVIEW_GROUPS, REVIEW_TOTAL } from "@/lib/reviews";

/** REVIEW · NAVER */
export function Review() {
  const [basic, classic, days] = REVIEW_GROUPS;
  return (
    <section id="review" className="night band" aria-labelledby="rev-h">
      <div className="wrap">
        <div className="rev-head">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">REVIEW · NAVER</p>
            <h2 id="rev-h" className="display">
              Kind <em>words</em> from families
            </h2>
            <p className="muted cap" style={{ margin: 0 }}>
              네이버 예약 방문자 리뷰 {REVIEW_TOTAL}개, {basic.name} 평점 {basic.score}이에요. 카드를 누르면
              네이버에서 원문을 볼 수 있어요.
            </p>
          </div>
          <div className="rev-actions">
            <Link className="btn" href="/reviews">
              리뷰 더 보기
            </Link>
            <a className="btn" href={NAVER_URL} target="_blank" rel="noopener">
              네이버에서 전체 리뷰 보기 ↗
            </a>
          </div>
        </div>
        <div className="rcards">
          {[basic, classic, days, basic].map((g, i) => (
            <ReviewCard key={g.concept + i} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
