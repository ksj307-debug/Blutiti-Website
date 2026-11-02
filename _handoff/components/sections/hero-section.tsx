import { AnimatedMarqueeHero, type HeroImage } from "@/components/ui/hero-3";

/**
 * 사진 폴더에서 16장을 골라 채울 것
 * - 컨셉(가족·만삭·반려견·웨딩 전 커플·흑백·100일·프로필 등)이 고르게 섞이도록
 * - 같은 폴더에서 연속 3장 이상 나오지 않게 순서 섞기
 * - 원본은 public/images/hero/ 로 복사하고, 가로 1200px 이하 · webp(또는 품질 80 jpg)로 최적화
 * - alt 는 "컨셉명 - 장면 설명" 형식의 한국어
 */
const HERO_IMAGES: HeroImage[] = [
  // { src: "/images/hero/family-01.webp", alt: "가족 컨셉 - 아이를 안고 웃는 부부" },
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
      secondaryHref="#concept"
      images={HERO_IMAGES}
    />
  );
}
