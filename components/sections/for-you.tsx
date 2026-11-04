import { Sentences } from "@/components/site/sentences";

/**
 * FOR YOU · 이런 분들이 많이 찾아주세요
 * 사진: 아직 임시 (레퍼런스 사진 / 빈 면). 새 사진 폴더를 받으면 3:4, 가로 1600px 이하 webp + 2배 srcset 으로 교체
 */
const STORIES: { eyebrow: string; title: string; desc: string; image?: string; alt?: string }[] = [
  {
    eyebrow: "FAMILY",
    image: "/images/reference/b1.jpg",
    alt: "베이직 컬러에서 생일 모자를 쓴 아이",
    title: "아이가 있는 가족",
    desc: "부끄러움 많은 아이도 OK! 아이 기분에 맞춰 천천히 찍어 주세요. 만 7세 이하 1명은 무료로 추가할 수 있어요.",
    // 예전: 아이 있는 가족 / 세팅은 끝났어요. 아이 기분에 맞춰 천천히 찍어요. 만 7세 이하 1명은 무료예요.
  },
  {
    eyebrow: "MATERNITY",
    image: "/images/reference/letter.jpg",
    alt: "만삭 부부의 흑백 사진에 하트 드로잉을 넣은 예시",
    title: "만삭 촬영",
    desc: "놓치면 아쉬운 만삭 사진, 꼭 남겨 주세요. 작가 없이 우리끼리만 있어서 편하고 자유롭게 찍을 수 있어요.",
    // 예전: 산모 가족 / 편한 날 오셔서 찍고, 사진은 집에서 골라요. 레터링·드로잉도 넣어드려요.
  },
  {
    eyebrow: "FAMILY PHOTO",
    title: "가족 사진",
    desc: "결혼기념일, 아이 생일처럼 우리 가족의 특별한 날마다 기념사진을 남겨 보세요! 우리 가족끼리 자유롭게 찍는 시간도 즐거운 추억이 될 거예요.",
    // 예전 WITH DOG 카드 (화면에서만 뺌. FAQ '반려견과 함께 가도 되나요?' 는 유지)
    // - eyebrow: WITH DOG / 타이틀: 강아지 키우는 커플
    // - 사진 자리 표시: 반려견 촬영 사진 준비 중
    // - 문구: 우리 강아지도 같이 찍어요. 방문 전에 카카오톡으로 먼저 문의해 주세요.
  },
  {
    eyebrow: "SELF WEDDING",
    image: "/images/reference/frame.jpg",
    alt: "원목 액자에 담긴 웨딩 흑백 사진",
    title: "셀프웨딩 촬영",
    desc: "자유로운 우리만의 모습을 남길 수 있어요. 웨딩드레스, 구두, 부케, 남자 정장까지 모두 준비되어 있어요. 평범한 게 싫은 신랑 신부라면 모여라!",
    // 예전: 결혼 준비 커플 / 꾸미지 않은 우리를 담아요. 원목 액자에 넣어 보내드릴 수도 있어요.
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
              {s.image ? <img src={s.image} alt={s.alt} /> : <div className="ph" aria-hidden="true" />}
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
