import { AnimatedMarqueeHero, type HeroImage } from "@/components/ui/hero-3";

/**
 * 히어로 마키 사진 16장 (샘플사진 폴더에서 선별, public/images/hero/ · 가로 900px webp)
 * - 6개 폴더를 섞어 같은 폴더 사진이 연달아 나오지 않게 배치
 * - 세이지 포레스트 폴더 사진은 베이직 컬러로 표기 (컨셉 통합)
 * - 반려견·프로필 사진은 폴더에 없어 제외. 사진이 생기면 교체
 */
const HERO_IMAGES: HeroImage[] = [
  { src: "/images/hero/hero-01-basic-couple.webp", alt: "베이직 컬러 - 꽃가지를 들고 장난스럽게 포즈를 취한 커플" },
  { src: "/images/hero/hero-02-bw-family.webp", alt: "클래식 흑백 - 아기를 안고 활짝 웃는 부부" },
  { src: "/images/hero/hero-03-christmas-family.webp", alt: "시즌 컨셉 크리스마스 - 트리 앞 바닥에 둘러앉은 가족" },
  { src: "/images/hero/hero-04-basic-birthday.webp", alt: "베이직 컬러 - 고깔모자를 쓰고 풍선을 든 생일 아이" },
  { src: "/images/hero/hero-05-bw-maternity.webp", alt: "클래식 흑백 - 아이를 안고 웃는 만삭 가족" },
  { src: "/images/hero/hero-06-100days-baby.webp", alt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기" },
  { src: "/images/hero/hero-07-basic-maternity-family.webp", alt: "베이직 컬러 - 딸과 함께 선 만삭 부부" },
  { src: "/images/hero/hero-08-graduation.webp", alt: "시즌 컨셉 졸업 - 학사모를 쓰고 크게 웃는 아이" },
  { src: "/images/hero/hero-09-basic-maternity.webp", alt: "베이직 컬러 - 사진 띠를 들고 나란히 선 만삭 부부" },
  { src: "/images/hero/hero-10-bw-wedding.webp", alt: "클래식 흑백 - 베일을 함께 쓰고 웃는 웨딩 전 커플" },
  { src: "/images/hero/hero-11-christmas-tree.webp", alt: "시즌 컨셉 크리스마스 - 트리와 선물 상자 앞의 가족" },
  { src: "/images/hero/hero-12-basic-baby-family.webp", alt: "베이직 컬러 - 아기를 가운데 두고 웃는 부부" },
  { src: "/images/hero/hero-13-100days-parents.webp", alt: "100일상 - 백일상 뒤에서 아기와 함께한 부모" },
  { src: "/images/hero/hero-14-bw-family-stools.webp", alt: "클래식 흑백 - 스툴에 앉아 아이와 웃는 가족" },
  { src: "/images/hero/hero-15-basic-balloons.webp", alt: "베이직 컬러 - 숫자 풍선 앞에서 꽃가지를 든 아이" },
  { src: "/images/hero/hero-16-graduation-cap.webp", alt: "시즌 컨셉 졸업 - 학사모를 두 손으로 잡은 아이" },
];

export default function HeroSection() {
  return (
    <AnimatedMarqueeHero
      tagline="BLUTITI SELFIE STUDIO · 안산"
      title={
        <>
          우리의 오늘을,
          <br />
          가장 우리답게
        </>
      }
      description="가족, 만삭, 반려견, 웨딩 전 커플까지. 눈치 보지 않고 우리끼리 편하게 찍는 셀프 사진관, 블루티티예요."
      ctaText="예약하기"
      ctaHref="#booking"
      secondaryText="컨셉 보기"
      secondaryHref="#concepts"
      images={HERO_IMAGES}
    />
  );
}
