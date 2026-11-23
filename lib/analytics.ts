/**
 * 구글 애널리틱스(GA4) 설정 (2026-11-23)
 * - 측정 ID: GA 관리 > 데이터 스트림 '블루티티 홈페이지'(blutiti.com)
 * - 고객 전용 화면(/mypage 등)은 기록하지 않음: 주소에 예약번호가 들어가서
 * - 페이지 조회(page_view)는 사이트 코드가 직접 보냄 (GA 의 '브라우저 기록 이벤트 기반 페이지 변경'은 꺼 두기)
 */
export const GA_ID = "G-S5L8K5S4YJ";

/** 기록하지 않는 주소 (고객 전용·예전 예약 조회) */
export function isPrivatePath(pathname: string): boolean {
  return ["/mypage", "/login", "/my-booking"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * 버튼 클릭 이벤트: 이 선택자에 맞는 링크·버튼을 누르면 GA 이벤트를 보냄 (컴포넌트는 고치지 않고 여기서만 관리)
 * - booking_click: 예약 버튼 (GA 에서 '주요 이벤트'로 표시하면 전환으로 볼 수 있어요)
 */
export const GA_CLICK_EVENTS: { selector: string; name: string; params: Record<string, string> }[] = [
  { selector: ".cta-book", name: "booking_click", params: { location: "bottom_bar", channel: "booking_section" } },
  { selector: ".book-btn-naver", name: "booking_click", params: { location: "booking_section", channel: "naver" } },
  { selector: ".book-btn-kakao", name: "booking_click", params: { location: "booking_section", channel: "kakao" } },
  { selector: ".cta-kakao", name: "kakao_chat_click", params: { location: "bottom_bar" } },
  { selector: ".map-links a", name: "map_open", params: { location: "location_section" } },
  { selector: ".copy-btn", name: "copy_click", params: { location: "location_section" } },
  { selector: ".ig-more-btn", name: "instagram_click", params: { location: "gallery" } },
  { selector: ".top-mypage", name: "mypage_click", params: { location: "header" } },
];
