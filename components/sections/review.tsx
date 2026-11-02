import Link from "next/link";
import type { CSSProperties } from "react";
import { Marquee } from "@/components/ui/3d-testimonials";
import { ReviewCard } from "@/components/site/review-card";
import { NAVER_REVIEW_URL, REVIEW_GROUPS, REVIEW_TOTAL, REVIEWS } from "@/lib/reviews";

/**
 * REVIEW · 네이버 방문자 리뷰를 기울어진 세로 마키(3d-testimonials)로
 * - 4줄이 위/아래로 번갈아 흐르고, 마우스를 올리면 멈춤
 * - 리뷰 문장은 lib/reviews.ts REVIEWS. 비어 있으면 컨셉별 자리 표시 카드
 */
const COLUMNS = 4;

export function Review() {
  const [basic] = REVIEW_GROUPS;
  const cards = REVIEWS.length
    ? REVIEWS.map((r, i) => <ReviewCard key={i} review={r} compact />)
    : REVIEW_GROUPS.map((g) => <ReviewCard key={g.concept} group={g} compact />);

  return (
    <section id="review" className="night band" aria-labelledby="rev-h">
      <div className="wrap rev-grid">
        <div className="rev-head">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">REVIEW</p>
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
            <a className="btn" href={NAVER_REVIEW_URL} target="_blank" rel="noopener">
              네이버에서 전체 리뷰 보기 ↗
            </a>
          </div>
        </div>

        <div className="rev-stage">
          <div className="rev-tilt">
            {Array.from({ length: COLUMNS }, (_, i) => (
              <Marquee
                key={i}
                vertical
                pauseOnHover
                reverse={i % 2 === 1}
                repeat={3}
                className={i >= 2 ? "rev-col-extra" : undefined}
                style={{ "--duration": `${36 + i * 4}s` } as CSSProperties}
                ariaLabel={i === 0 ? "고객 리뷰" : undefined}
                // 같은 카드가 4줄에 반복되므로 첫 줄만 읽히고 탭 이동되게
                inert={i > 0 || undefined}
              >
                {cards}
              </Marquee>
            ))}
          </div>
          {/* 가장자리 페이드 (night 배경으로) */}
          <div className="rev-fade rev-fade-t" aria-hidden="true" />
          <div className="rev-fade rev-fade-b" aria-hidden="true" />
          <div className="rev-fade rev-fade-l" aria-hidden="true" />
          <div className="rev-fade rev-fade-r" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
