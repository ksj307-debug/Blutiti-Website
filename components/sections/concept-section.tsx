import Link from "next/link";
import { Sentences } from "@/components/site/sentences";
import { ConceptCarousel } from "@/components/ui/concept-carousel";
import { SIZES, srcSet } from "@/lib/img";
import { CONCEPTS, bookingHref, type ConceptId } from "@/lib/concepts";

/**
 * CONCEPTS · 같은 크기 카드 가로 캐러셀 (components/ui/concept-carousel.tsx)
 * 카드: 사진(4:5, 왼쪽 아래 영문 라벨) → 한글 타이틀 → 설명 → '이걸로 예약하기'
 * - 예약 버튼이 여러 개 동시에 보여 코발트 대신 보조 버튼(.btn-secondary)
 * - 사진이 없는 컨셉은 --mist 면 (사진이 생기면 image 로 교체)
 * 이전 버전(embla 세로 카드 + 자동 넘김)은 git 기록에 있음
 */
const COPY: Record<
  ConceptId,
  { description: string; image?: string; srcSet?: string; imageAlt?: string; imagePosition?: string }
> = {
  // 4개 컨셉 문구 = 레퍼런스(_handoff/reference/index.html) CONCEPTS 섹션 문구 그대로
  "basic-color": {
    description: "화려한 배경 없이 자연스러운 빛과 색으로 담는 미니멀 촬영",
    // 구글 드라이브 베이직 컬러 폴더 '박나현07642.jpg' (예전 사진 basic-color.webp 는 그대로 둠)
    image: "/images/concepts/basic-color-v2.webp",
    srcSet: srcSet("/images/concepts/basic-color-v2.webp", [400, 560, 640, 680], 800, [["/images/concepts/basic-color-v2@2x.webp", 1600]]),
    imageAlt: "베이직 컬러 - 하트 풍선 아래에서 케이크를 들고 웃는 아이",
  },
  "classic-bw": {
    description: "색을 덜어내고 표정과 감정의 결을 선명하게",
    // 구글 드라이브 '정기정_클래식01465.jpg' (예전 사진 classic-bw.webp 는 그대로 둠)
    image: "/images/concepts/classic-bw-v2.webp",
    srcSet: srcSet("/images/concepts/classic-bw-v2.webp", [400, 560, 640, 680], 800, [["/images/concepts/classic-bw-v2@2x.webp", 1600]]),
    imageAlt: "클래식 흑백 - 아기를 안고 꽃다발을 든 부부",
  },
  "100days": {
    // 예전: 한복과 정성스럽게 준비한 떡으로 차리는 아기의 첫 잔치
    description: "프리미엄 한복과 백일상이 준비되어 있어요. 몸만 오셔서 아기의 첫 잔치를 남겨 보세요.",
    image: "/images/concepts/100days.webp",
    srcSet: srcSet("/images/concepts/100days.webp", [400, 560, 640, 680], 1200),
    imageAlt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기",
  },
  // 구글 드라이브 증명·프로필 폴더 '이가림_419.jpg' → 4:5, 1x 800px / 2x 1600px webp(품질 85)
  "id-profile": {
    // 타이틀(증명·프로필)과 겹치지 않게 '증명 · 여권 · 프로필' 줄은 뺌
    // 예전: 증명·여권은 30분 촬영, 셀렉은 집에서. 당일 인화는 어려워요
    description: "30분간 셀프로 촬영하세요, 원하는 부분을 보정해 6장 인화해 드립니다. (*당일 인화 불가)",
    image: "/images/concepts/id-profile.webp",
    srcSet: srcSet("/images/concepts/id-profile.webp", [400, 560, 640, 680], 800, [["/images/concepts/id-profile@2x.webp", 1600]]),
    imageAlt: "증명·프로필 - 흰 셔츠를 입고 정면을 바라보는 증명사진",
  },
  "season-christmas": {
    description: "매년 새롭게 변경되는 크리스마스 컨셉으로 가족 또는 연인과 함께 특별한 크리스마스 추억을 남겨보세요.",
    image: "/images/concepts/season.webp",
    srcSet: srcSet("/images/concepts/season.webp", [400, 560, 640, 680], 1200),
    imageAlt: "시즌 크리스마스 - 크리스마스 트리 앞 가족 사진",
  },
  "season-graduation": {
    description: "아이의 졸업사진을 특별하게 남겨주세요. 학사모와 가운은 모두 준비되어 있답니다.",
    image: "/images/hero/hero-08-graduation.webp",
    srcSet: srcSet("/images/hero/hero-08-graduation.webp", [480, 560, 640, 680], 900),
    imageAlt: "시즌 졸업 - 학사모를 쓰고 크게 웃는 아이",
  },
};

export default function ConceptSection() {
  return (
    <section id="concepts" className="band legacy-anchor-host" aria-labelledby="concept-h">
      {/* 예전 주소 /#concept 로 들어와도 이 섹션으로 이동 */}
      <span id="concept" className="legacy-anchor" aria-hidden="true" />
      <div className="wrap">
        <ConceptCarousel
          label="CONCEPTS"
          head={
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p className="eyebrow">CONCEPTS</p>
              {/* 예전 영문 헤드라인 'Five ways to be us' 는 뺌 */}
              <h2 id="concept-h" className="t-heading-kr-lg" style={{ margin: 0, wordBreak: "keep-all" }}>
                원하는 분위기를 골라보세요
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                <Sentences text="'베이직 컬러'와 '클래식 흑백'은 반반 옵션으로 선택할 수 있어요." />
              </p>
            </div>
          }
        >
          {CONCEPTS.map((c) => {
            const copy = COPY[c.id];
            return (
              <article className="cc-card" key={c.id}>
                <div className="cc-photo" data-cc-photo>
                  {copy.image && (
                    <img
                      src={copy.image}
                      srcSet={copy.srcSet}
                      sizes={copy.srcSet ? SIZES.concept : undefined}
                      alt={copy.imageAlt ?? ""}
                      loading="lazy"
                      style={{ objectPosition: copy.imagePosition ?? "center" }}
                    />
                  )}
                  <span className="t-eyebrow cc-label">{c.label}</span>
                </div>
                <h3 className="t-title-kr">{c.name}</h3>
                <p className="t-body muted">
                  <Sentences text={copy.description} />
                </p>
                <Link className="btn-secondary cc-book" href={bookingHref(c.id)} aria-label={`${c.bookingName} 이걸로 예약하기`}>
                  이걸로 예약하기
                </Link>
              </article>
            );
          })}
        </ConceptCarousel>
      </div>
    </section>
  );
}
