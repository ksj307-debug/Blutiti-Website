"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CONCEPTS, bookingHref, type ConceptId } from "@/lib/concepts";

/**
 * CONCEPT · 세로 카드 가로 캐러셀 (원본: 21st.dev carousel-08 Apple 카드)
 * 원본 대비 수정 사항 (BLUTITI 디자인 시스템)
 * - 카드 radius 0, 그림자 없음, 사진 위 글자는 위·아래 night 그라데이션 위에 on-night
 * - 카테고리 = 컨셉 영문 라벨(eyebrow), 제목 = lib/concepts.ts 컨셉명(고운바탕), 아래 설명 + ↗
 * - 카드 전체가 '이걸로 예약하기' 링크 (/?concept={id}#booking). 여러 장이 보여 코발트는 쓰지 않음
 * - 화살표는 사이트 1px 원형 버튼, 움직임 줄이기 설정이면 확대 효과 없음
 */
const COPY: Record<ConceptId, { description: string; image?: string; imageAlt?: string; imagePosition?: string }> = {
  // 4개 컨셉 문구 = 레퍼런스(_handoff/reference/index.html) CONCEPTS 섹션 문구 그대로
  "basic-color": {
    description: "화려한 배경 없이 자연스러운 빛과 색으로 담는 미니멀 촬영",
    image: "/images/concepts/basic-color.webp",
    imageAlt: "베이직 컬러 - 숫자 풍선과 함께 바닥에 앉은 가족",
  },
  "classic-bw": {
    description: "색을 덜어내고 표정과 감정의 결을 선명하게",
    image: "/images/concepts/classic-bw.webp",
    imageAlt: "클래식 흑백 - 스툴에 앉은 두 아이와 뒤에 선 부부",
  },
  "100days": {
    description: "한복과 정성스럽게 준비한 떡으로 차리는 아기의 첫 잔치",
    image: "/images/concepts/100days.webp",
    imageAlt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기",
  },
  // 사진 폴더에 증명·프로필 사진이 없어 임시로 paper-200 면 (사진이 생기면 image 로 교체)
  "id-profile": {
    description: "증명·여권은 30분 촬영, 셀렉은 집에서. 당일 인화는 어려워요",
  },
  season: {
    description:
      "지금 이 계절에만 남길 수 있는 장면이에요. 졸업 시즌엔 학사모와 꽃다발로 한 시절의 마무리를, 크리스마스 시즌엔 트리와 따뜻한 조명 아래 함께한 한 해를 담아드려요.",
    image: "/images/concepts/season.webp",
    imageAlt: "시즌 컨셉 - 크리스마스 트리 앞 가족 사진",
  },
};

export default function ConceptSection() {
  return (
    <section id="concept" className="band" aria-labelledby="concept-h">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">CONCEPT</p>
          <h2 id="concept-h" className="display">
            Five <em>ways</em> to be us
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            원하는 분위기를 골라보세요. 클래식 흑백은 반반 옵션으로 촬영 중간에 추가할 수도 있어요.
          </p>
        </div>
      </div>

      <Carousel opts={{ align: "start", dragFree: true }} aria-label="컨셉">
        {/* 첫 카드는 본문 여백(wrap)에 맞추고, 오른쪽은 화면 끝까지 흐르게 */}
        <CarouselContent className="-ml-6 concept-track">
          {CONCEPTS.map((c) => {
            const copy = COPY[c.id];
            const title = c.themes ? `${c.name} · ${c.themes.join(" & ")}` : c.name;
            return (
              <CarouselItem key={c.id} className="basis-auto pl-6">
                <a
                  href={bookingHref(c.id)}
                  className={`ccard${copy.image ? "" : " ccard-plain"}`}
                  aria-label={`${title} — 이걸로 예약하기`}
                >
                  {copy.image && (
                    <img
                      src={copy.image}
                      alt={copy.imageAlt ?? ""}
                      loading="lazy"
                      className="ccard-img"
                      style={{ objectPosition: copy.imagePosition ?? "center" }}
                    />
                  )}
                  <span className="ccard-top">
                    <span className="t-eyebrow">{c.label}</span>
                    <span className="ccard-title">{title}</span>
                  </span>
                  <span className="ccard-bottom">
                    <span className="ccard-desc">{copy.description}</span>
                    <span className="ccard-go" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </a>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="wrap concept-controls">
          <p className="cap muted">카드를 누르면 그 컨셉으로 예약 화면이 열려요.</p>
          <span className="concept-arrows">
            <CarouselPrevious />
            <CarouselNext />
          </span>
        </div>
      </Carousel>
    </section>
  );
}
