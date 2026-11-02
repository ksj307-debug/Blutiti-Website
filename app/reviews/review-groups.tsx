"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/site/review-card";
import { NAVER_URL, REVIEW_GROUPS, REVIEWS } from "@/lib/reviews";

const ALL = "전체";

/** 컨셉별 필터 칩 + 리뷰 그룹 */
export function ReviewGroups() {
  const [filter, setFilter] = useState(ALL);
  const groups = REVIEW_GROUPS.filter((g) => filter === ALL || g.name === filter);

  return (
    <>
      <div className="chips" role="group" aria-label="컨셉별 보기">
        {[ALL, ...REVIEW_GROUPS.map((g) => g.name)].map((name) => (
          <button key={name} type="button" className="chip" aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <section className="rp-group" key={g.concept}>
          <div className="rp-group-h">
            <div>
              <p className="eyebrow" style={{ margin: "0 0 6px" }}>
                {g.count} REVIEWS
              </p>
              <h2 className="h-kr">{g.name}</h2>
            </div>
            <span className="score">★ {g.score}</span>
          </div>
          <div className="rcards">
            {/* 등록된 리뷰 문장을 먼저, 모자라면 자리 표시 카드로 최대 3장 */}
            {Array.from({ length: Math.min(g.count, 3) }, (_, i) => {
              const review = REVIEWS.filter((r) => r.concept === g.concept)[i];
              return <ReviewCard key={i} group={g} review={review} />;
            })}
          </div>
          <p style={{ margin: "var(--space-6) 0 0" }}>
            <a className="link" href={NAVER_URL} target="_blank" rel="noopener">
              {g.name} 리뷰 {g.count}개 네이버에서 보기 ↗
            </a>
          </p>
        </section>
      ))}
    </>
  );
}
