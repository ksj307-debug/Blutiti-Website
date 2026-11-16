/**
 * 마이페이지 화면 설정 (사장님이 직접 고치는 값)
 *
 * ORDER_ITEMS: '추가 주문' 탭의 체크 항목
 * - name 은 고객 답변에 그대로 저장되는 이름 (responses.content.items). 이미 받은 답변과 맞추려면 이름은 되도록 그대로 두세요
 * - price 만 바꾸면 화면 가격과 합계가 바뀌어요 (원 단위 숫자)
 * - note: 항목 아래 작은 안내 (없으면 생략)
 */
export type OrderItem = { name: string; price: number; note?: string };

export const ORDER_ITEMS: readonly OrderItem[] = [
  { name: "사진 보정 추가 (1컷)", price: 15000 },
  { name: "사진 인화 추가 (1장)", price: 5000 },
  { name: "증명/프로필 사진 보정&인화", price: 15000, note: "파일명 아래 메모에 기입" },
  { name: "4컷 프레임 (5x7인치 2장)", price: 20000, note: "파일명 아래 메모에 기입" },
  { name: "A3 디자인 포스터 (1세트 3장)", price: 40000 },
  { name: "원목액자 구매", price: 10000 },
  { name: "고화질 원본 구매", price: 20000 },
  { name: "레터링 작업 (1컷)", price: 5000 },
];

/** 추가 주문 탭 위 안내 (입금 계좌) */
export const ORDER_NOTICE = {
  lead: "촬영 후 추가로 옵션 구매를 원하시면 선택해 주세요. 입금 확인 후 제공됩니다.",
  /** 화면: (입금 계좌: 카카오뱅크 3333-03-3090322 김승준). 계좌번호는 줄바꿈 없이 한 덩어리로 */
  account: { bank: "카카오뱅크", number: "3333-03-3090322", holder: "김승준" },
  depositor: "*'받는 분에게 표시'란에 예약자명을 입력해 주세요.",
} as const;

/**
 * 예전 항목 (2026-11 첫 버전, 금액 없음). 이 이름으로 이미 저장된 답변은 화면에 원문 그대로 보여줘요
 * 예전 이름: MYPAGE_ORDER_ITEMS
 */
export const LEGACY_ORDER_ITEMS: readonly string[] = ["보정 추가", "인화", "액자"];

/** 원화 콤마 표기: 15000 → "15,000원" */
export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
