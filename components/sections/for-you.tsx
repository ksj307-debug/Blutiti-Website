import { Sentences } from "@/components/site/sentences";
import { ConceptCarousel } from "@/components/ui/concept-carousel";
import { SIZES, srcSet } from "@/lib/img";

/**
 * FOR YOU · 이런 분들이 많이 찾아주세요
 * 사진: 3:4, 1x 800px / 2x 1600px webp(품질 85) + srcset
 * 원본 = 구글 드라이브 폴더별 1장 → /images/for-you/*.webp (@2x)
 * - 아이가 있는 가족: '유주지안6_noletter.jpg' / 만삭 촬영: '이보미31498.jpg'
 * - 가족 사진: '김한빛29516.jpg' / 셀프웨딩 촬영: 'blutiti_상품사진템플렛_클래식흑백2.jpg' (템플릿 테두리 잘라냄)
 * 예전 레퍼런스 사진(b1.jpg, letter.jpg, frame.jpg)은 public/images/reference 에 그대로 둠
 */
const STORIES: { eyebrow: string; title: string; desc: string; image?: string; srcSet?: string; alt?: string }[] = [
  {
    eyebrow: "FAMILY",
    image: "/images/for-you/kids-family.webp",
    srcSet: srcSet("/images/for-you/kids-family.webp", [440, 560, 640, 700], 800, [["/images/for-you/kids-family@2x.webp", 1600]]),
    alt: "풍선을 안고 활짝 웃는 두 아이",
    title: "아이가 있는 가족",
    desc: "부끄러움 많은 아이도 OK! 아이 기분에 맞춰 천천히 찍어 주세요. 만 7세 이하 1명은 무료로 추가할 수 있어요.",
    // 예전: 아이 있는 가족 / 세팅은 끝났어요. 아이 기분에 맞춰 천천히 찍어요. 만 7세 이하 1명은 무료예요.
  },
  {
    eyebrow: "MATERNITY",
    // 샘플사진 '만삭/손평강_흑백00550.jpg' (2:3 → 3:4, 위 110px부터 잘라 얼굴·배·발까지 보이게). 2x 는 원본 폭 1365px 까지만
    // 예전 사진(maternity.webp, '이보미31498.jpg', alt '딸의 손을 잡고 선 만삭 부부')은 파일 그대로 두고 화면에서만 뺌
    image: "/images/for-you/foryou-maternity.webp",
    srcSet: srcSet("/images/for-you/foryou-maternity.webp", [440, 560, 640, 700], 800, [["/images/for-you/foryou-maternity@2x.webp", 1365]]),
    alt: "클래식 흑백 - 초음파 사진을 든 엄마와 아이, 아빠가 나란히 앉아 웃는 만삭 가족",
    title: "만삭 촬영",
    desc: "놓치면 아쉬운 만삭 사진, 꼭 남겨 주세요. 작가 없이 우리끼리만 있어서 편하고 자유롭게 찍을 수 있어요.",
    // 예전: 산모 가족 / 편한 날 오셔서 찍고, 사진은 집에서 골라요. 레터링·드로잉도 넣어드려요.
  },
  {
    eyebrow: "FAMILY PHOTO",
    image: "/images/for-you/family-photo.webp",
    srcSet: srcSet("/images/for-you/family-photo.webp", [440, 560, 640, 700], 800, [["/images/for-you/family-photo@2x.webp", 1600]]),
    alt: "흰 배경 앞에서 두 아이를 안고 활짝 웃는 부부",
    title: "가족 사진",
    desc: "결혼기념일, 아이 생일처럼 우리 가족의 특별한 날마다 기념사진을 남겨 보세요! 우리 가족끼리 자유롭게 찍는 시간도 즐거운 추억이 될 거예요.",
    // 예전 WITH DOG 카드 (화면에서만 뺌. FAQ '반려견과 함께 가도 되나요?' 는 유지)
    // - eyebrow: WITH DOG / 타이틀: 강아지 키우는 커플
    // - 사진 자리 표시: 반려견 촬영 사진 준비 중
    // - 문구: 우리 강아지도 같이 찍어요. 방문 전에 카카오톡으로 먼저 문의해 주세요.
  },
  {
    eyebrow: "SELF WEDDING",
    image: "/images/for-you/self-wedding.webp",
    srcSet: srcSet("/images/for-you/self-wedding.webp", [440, 560, 640, 700], 800, [["/images/for-you/self-wedding@2x.webp", 1600]]),
    alt: "흑백 사진 - 베일을 함께 쓰고 웃는 신랑 신부",
    title: "셀프웨딩 촬영",
    desc: "자유로운 우리만의 모습을 남길 수 있어요. 웨딩드레스, 구두, 부케, 남자 정장까지 모두 준비되어 있어요. 평범한 게 싫은 신랑 신부라면 모여라!",
    // 예전: 결혼 준비 커플 / 꾸미지 않은 우리를 담아요. 원목 액자에 넣어 보내드릴 수도 있어요.
  },
];

export function ForYou() {
  return (
    <section className="alt band" aria-labelledby="who-h">
      <div className="wrap">
        {/* CONCEPTS 와 같은 캐러셀 (모바일 1장·태블릿 2장·데스크톱 3장 + 다음 카드 일부) */}
        <ConceptCarousel
          label="FOR YOU"
          perView={{ mobile: 1, tablet: 2, desktop: 3 }}
          head={
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p className="eyebrow">FOR YOU</p>
              <h2 id="who-h" className="h-kr">
                이런 분들이 많이 찾아주세요
              </h2>
            </div>
          }
        >
          {STORIES.map((s) => (
            <article className="story" key={s.eyebrow}>
              <p className="eyebrow">{s.eyebrow}</p>
              {s.image ? (
                <img
                  src={s.image}
                  srcSet={s.srcSet}
                  sizes={s.srcSet ? SIZES.forYou : undefined}
                  alt={s.alt}
                  loading="lazy"
                  data-cc-photo
                />
              ) : (
                <div className="ph" aria-hidden="true" data-cc-photo />
              )}
              <h3 className="t-kr">{s.title}</h3>
              <p className="muted cap">
                <Sentences text={s.desc} />
              </p>
            </article>
          ))}
        </ConceptCarousel>
      </div>
    </section>
  );
}
