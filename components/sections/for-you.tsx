import { Sentences } from "@/components/site/sentences";

/** FOR YOU · 이런 분들이 많이 찾아주세요 */
const STORIES = [
  {
    eyebrow: "FAMILY",
    image: "/images/reference/b1.jpg",
    alt: "베이직 컬러에서 생일 모자를 쓴 아이",
    title: "아이 있는 가족",
    desc: "세팅은 끝났어요. 아이 기분에 맞춰 천천히 찍어요. 만 7세 이하 1명은 무료예요.",
  },
  {
    eyebrow: "MATERNITY",
    image: "/images/reference/letter.jpg",
    alt: "만삭 부부의 흑백 사진에 하트 드로잉을 넣은 예시",
    title: "산모 가족",
    desc: "편한 날 오셔서 찍고, 사진은 집에서 골라요. 레터링·드로잉도 넣어드려요.",
  },
  {
    eyebrow: "WITH DOG",
    title: "강아지 키우는 커플",
    desc: "우리 강아지도 같이 찍어요. 방문 전에 카카오톡으로 먼저 문의해 주세요.",
  },
  {
    eyebrow: "PRE-WEDDING",
    image: "/images/reference/frame.jpg",
    alt: "원목 액자에 담긴 웨딩 흑백 사진",
    title: "결혼 준비 커플",
    desc: "꾸미지 않은 우리를 담아요. 원목 액자에 넣어 보내드릴 수도 있어요.",
  },
];

export function ForYou() {
  return (
    <section className="alt band" aria-labelledby="who-h">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">FOR YOU</p>
          <h2 id="who-h" className="h-kr">
            이런 분들이 많이 찾아주세요
          </h2>
        </div>
        <div className="stories">
          {STORIES.map((s) => (
            <article className="story" key={s.eyebrow}>
              <p className="eyebrow">{s.eyebrow}</p>
              {s.image ? (
                <img src={s.image} alt={s.alt} />
              ) : (
                <div className="ph">
                  <p className="muted cap">
                    반려견 촬영 사진
                    <br />
                    준비 중
                  </p>
                </div>
              )}
              <h3 className="t-kr">{s.title}</h3>
              <p className="muted cap">
                <Sentences text={s.desc} />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
