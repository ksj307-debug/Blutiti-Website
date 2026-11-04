import { CONCEPTS, type ConceptId } from "@/lib/concepts";

/**
 * 미사용: CONCEPT 카드 (레퍼런스 레이아웃). 컨셉 목록·순서는 lib/concepts.ts
 * 5단계에서 스퀴즈 캐러셀(components/sections/concept-section.tsx)로 교체. 되돌릴 때를 위해 보관
 */
const COPY: Record<ConceptId, { en: string; desc: string; image?: string; alt?: string }> = {
  "basic-color": {
    en: "Basic Color",
    desc: "화려한 배경 없이 자연스러운 빛과 색으로 담는 미니멀 촬영",
    image: "/images/reference/c-basic.jpg",
    alt: "베이직 컬러 컨셉 예시",
  },
  "classic-bw": {
    en: "Classic B&W",
    desc: "색을 덜어내고 표정과 감정의 결을 선명하게",
    image: "/images/reference/c-classic.jpg",
    alt: "클래식 흑백 컨셉 예시",
  },
  "100days": {
    en: "100 Days",
    desc: "한복과 정성스럽게 준비한 떡으로 차리는 아기의 첫 잔치",
    image: "/images/reference/c-100days.jpg",
    alt: "100일상 컨셉 예시",
  },
  "id-profile": {
    en: "ID & Profile",
    desc: "증명·여권은 30분 촬영, 셀렉은 집에서. 당일 인화는 어려워요",
    image: "/images/reference/c-profile.jpg",
    alt: "증명·프로필 촬영 예시",
  },
  // 문구 = _handoff/components/sections/concept-section.tsx 시즌 컨셉 문구
  season: {
    en: "Season",
    desc: "지금 이 계절에만 남길 수 있는 장면이에요. 졸업 시즌엔 학사모와 꽃다발로 한 시절의 마무리를, 크리스마스 시즌엔 트리와 따뜻한 조명 아래 함께한 한 해를 담아드려요.",
  },
};

export function Concept() {
  return (
    <section id="concepts" className="band wrap" aria-labelledby="concept-h">
      <div className="section-head">
        <p className="eyebrow">CONCEPTS</p>
        <h2 id="concept-h" className="display">
          Five <em>ways</em> to be us
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          컨셉은 다섯 가지예요. 클래식 흑백은 반반 옵션으로 촬영 중간에 추가할 수도 있어요.
        </p>
      </div>
      <div className="concepts">
        {CONCEPTS.map((c) => {
          const copy = COPY[c.id];
          return (
            <article className="concept" key={c.id}>
              {copy.image ? (
                <img src={copy.image} alt={copy.alt} />
              ) : (
                <div className="ph">
                  <p className="muted cap" style={{ margin: 0 }}>
                    {c.themes?.join(" · ")} 사진
                    <br />
                    준비 중
                  </p>
                </div>
              )}
              <span className="en">{copy.en}</span>
              <h3 className="t-kr">{c.name}</h3>
              <p className="muted cap">{copy.desc}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
