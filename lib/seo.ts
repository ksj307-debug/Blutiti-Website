import { INSTAGRAM_URL, KAKAO_URL, PHONE } from "@/lib/nav";
import { BUSINESS, STUDIO } from "@/lib/studio-info";
import { NAVER_URL } from "@/lib/reviews";
import { CONCEPTS } from "@/lib/concepts";

/**
 * 검색엔진(SEO)·공유 미리보기 설정 (2026-11-23)
 * - 문구는 사이트에 이미 있는 사실만 사용 (안산 초지역, 단독룸, 촬영 종류, 영업시간, 주소)
 * - 검색엔진 소유 확인 코드: 구글 서치 콘솔 / 네이버 서치어드바이저에서 받은 값을 아래에 넣으면 <meta> 로 나감
 */
export const SITE_URL = "https://blutiti.com";
export const SITE_NAME = "블루티티 셀프스튜디오";

export const SITE_TITLE = "블루티티 셀프스튜디오 | 안산 초지역 셀프사진관";
export const SITE_DESCRIPTION =
  "안산 초지역 단독룸 셀프사진관 블루티티. 가족사진, 만삭, 셀프웨딩, 아이생일, 100일상까지 1시간 20분 동안 우리끼리 자유롭게 찍어요. 전문 조명·배경·소품 준비, 무료 주차.";
export const SITE_KEYWORDS = [
  "블루티티",
  "블루티티 셀프스튜디오",
  "안산 셀프사진관",
  "안산 셀프스튜디오",
  "초지역 사진관",
  "안산 가족사진",
  "안산 만삭사진",
  "셀프웨딩",
  "아이 생일 사진",
  "100일 사진",
  "셀프 촬영",
];

/** 공유 미리보기 이미지 (public/og/blutiti-og.jpg, 1200x630: 촬영 사진 3장 + 로고) */
export const OG_IMAGE = { url: "/og/blutiti-og.jpg", width: 1200, height: 630, alt: "블루티티 셀프스튜디오 촬영 사진" };

/**
 * 검색엔진 소유 확인 코드 (값만, 따옴표 안에)
 * - google: 구글 서치 콘솔 > 속성 추가 > URL 접두어 > 'HTML 태그' 방식의 content 값
 * - naver : 네이버 서치어드바이저 > 사이트 등록 > 'HTML 태그' 방식의 content 값
 * 비어 있으면 태그를 넣지 않음
 */
export const SEARCH_VERIFICATION = { google: "", naver: "" };

/** 영업시간 (푸터 '매일 10:00~21:50'과 같게) */
const OPEN = "10:00";
const CLOSE = "21:50";

/** 가격 범위: lib/concepts.ts 판매 중인 가격의 최저~최고 (1~2인 기준) */
function priceRange(): string {
  const amounts = CONCEPTS.flatMap((c) => c.variants.flatMap((v) => Object.values(v.plans)))
    .filter((p) => p.available !== false && typeof p.amount === "number")
    .map((p) => p.amount as number);
  const fmt = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
  return `${fmt(Math.min(...amounts))}~${fmt(Math.max(...amounts))}`;
}

/** 메인 페이지 구조화 데이터 (schema.org LocalBusiness) → 검색 결과의 매장 정보 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    alternateName: ["블루티티", "BLUTITI SELFIE STUDIO"],
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE.url}`,
    logo: `${SITE_URL}/brand/blutiti-logo-horizontal-navy.png`,
    telephone: PHONE,
    priceRange: priceRange(),
    address: {
      "@type": "PostalAddress",
      streetAddress: "화랑로 130, 2동 2층 207호",
      addressLocality: "안산시 단원구",
      addressRegion: "경기도",
      addressCountry: "KR",
    },
    ...(STUDIO.lat !== null && STUDIO.lng !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: STUDIO.lat, longitude: STUDIO.lng } }
      : {}),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: OPEN,
        closes: CLOSE,
      },
    ],
    sameAs: [INSTAGRAM_URL, NAVER_URL, KAKAO_URL],
    // 사업자등록번호는 푸터와 같은 공개 정보
    taxID: BUSINESS.regNo,
  };
}
