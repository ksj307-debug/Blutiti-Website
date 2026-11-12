/** 메인 메뉴: 메뉴명 = 섹션 영문 제목(eyebrow), id = 섹션 id */
export const MAIN_NAV = [
  { label: "CONCEPTS", sub: "컨셉·갤러리", id: "concepts" },
  { label: "PRICE", sub: "요금 안내", id: "price" },
  { label: "REVIEW", sub: "고객 리뷰", id: "review" },
  { label: "GUIDE", sub: "이용 방법", id: "guide" },
  { label: "LOCATION", sub: "오시는 길", id: "location" },
] as const;

export const BOOKING_HREF = "/#booking";
export const LOGIN_HREF = "/login";
export const KAKAO_LABEL = "카카오톡 채널 '블루티티'";
/** 카카오톡 채널 '블루티티' 프로필 ID (채널 홈 URL 의 _ 로 시작하는 값) */
export const KAKAO_CHANNEL_ID = "_VexnFn";
/** 채널 홈 */
export const KAKAO_URL = `https://pf.kakao.com/${KAKAO_CHANNEL_ID}`;
/** 1:1 채팅 (Kakao SDK 를 쓸 수 없을 때 이동하는 주소) */
export const KAKAO_CHAT_URL = `${KAKAO_URL}/chat`;
export const INSTAGRAM_URL = "https://www.instagram.com/blutiti_studio/";
export const PHONE = "0507-1401-3190";
/** 카카오맵 장소 페이지 (LOCATION '카카오맵에서 보기') */
export const KAKAO_MAP_URL = "https://place.map.kakao.com/2101855012";
