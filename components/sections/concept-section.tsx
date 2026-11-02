"use client";

import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";
import { CONCEPTS, bookingHref, type ConceptId } from "@/lib/concepts";

/** 열린 패널 좌하단 영문 라벨 */
const mark = (text: string) => <span className="t-eyebrow text-[var(--on-night)]">{text}</span>;

/**
 * 컨셉별 문구·사진
 * - 클래식 흑백 대표 사진은 흑백 사진 사용
 * - image 는 사진 폴더의 해당 컨셉 대표 사진 1장 (public/images/concepts/)
 * - 세로 인물 사진은 16:9 로 크롭되므로 imagePosition 으로 얼굴 위치 보정 (예: "center 30%")
 */
const COPY: Record<
  ConceptId,
  Pick<SqueezeSlide, "description" | "image" | "imageAlt" | "imagePosition" | "background">
> = {
  // 4개 컨셉 문구 = 레퍼런스(_handoff/reference/index.html) CONCEPTS 섹션 문구 그대로
  "basic-color": {
    description: "화려한 배경 없이 자연스러운 빛과 색으로 담는 미니멀 촬영",
    image: "/images/concepts/basic-color.webp",
    imageAlt: "베이직 컬러 - 숫자 풍선과 함께 바닥에 앉은 가족",
    imagePosition: "center 55%",
  },
  "classic-bw": {
    description: "색을 덜어내고 표정과 감정의 결을 선명하게",
    image: "/images/concepts/classic-bw.webp",
    imageAlt: "클래식 흑백 - 스툴에 앉은 두 아이와 뒤에 선 부부",
    imagePosition: "center 40%",
  },
  "100days": {
    description: "한복과 정성스럽게 준비한 떡으로 차리는 아기의 첫 잔치",
    image: "/images/concepts/100days.webp",
    imageAlt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기",
    imagePosition: "center 35%",
  },
  // 사진 폴더에 증명·프로필 사진이 없어 임시로 --mist 배경 (사진이 생기면 image 로 교체)
  "id-profile": {
    description: "증명·여권은 30분 촬영, 셀렉은 집에서. 당일 인화는 어려워요",
    background: "var(--mist)",
  },
  // 신규
  season: {
    description:
      "지금 이 계절에만 남길 수 있는 장면이에요. 졸업 시즌엔 학사모와 꽃다발로 한 시절의 마무리를, 크리스마스 시즌엔 트리와 따뜻한 조명 아래 함께한 한 해를 담아드려요.",
    image: "/images/concepts/season.webp",
    imageAlt: "시즌 컨셉 - 크리스마스 트리 앞 가족 사진",
    imagePosition: "center 50%",
  },
};

// CONCEPTS 순서를 따르므로 시즌 컨셉이 항상 마지막
// 제목 = lib/concepts.ts 컨셉명 (+ 시즌 테마). PRICE·BOOKING 과 같은 이름
const slides: SqueezeSlide[] = CONCEPTS.map((c) => ({
  id: c.id,
  title: c.themes ? `${c.name} · ${c.themes.join(" & ")}` : c.name,
  ...COPY[c.id],
  overlay: mark(c.label),
  action: "이걸로 예약하기",
  href: bookingHref(c.id),
}));

export default function ConceptSection() {
  return (
    // data-own-cta: 이 섹션의 '이걸로 예약하기'(코발트)가 보이는 동안 헤더 예약하기는 보조 버튼
    <section id="concept" data-own-cta className="scroll-mt-24 bg-[var(--paper-100)] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-10 grid max-w-[640px] gap-2">
          <p className="t-eyebrow m-0 text-[var(--ink-muted)]">CONCEPT</p>
          <h2 className="t-display-md m-0">
            Five <em>ways</em> to be us
          </h2>
          <p className="t-body m-0 text-[var(--ink-muted)]">
            원하는 분위기를 골라보세요. 클래식 흑백은 반반 옵션으로 촬영 중간에 추가할 수도 있어요.
          </p>
        </header>

        <SqueezeCarousel
          slides={slides}
          label="CONCEPT"
          height="clamp(240px, 34cqi, 420px)"
          gap={24}
          slatGap={8}
          slatWidth={8}
          radius={0}
          duration={1000}
          hoverGrow
          autoplay={false}
          controls
        />
      </div>
    </section>
  );
}
