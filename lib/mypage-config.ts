/**
 * 마이페이지 화면 설정 (사장님이 직접 고치는 값)
 *
 * ORDER_ITEMS: '촬영 후 추가 구매' 탭의 체크 항목 (예전 이름: 추가 주문. 저장 type 은 그대로 'order')
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

/**
 * 셀렉 탭 질문 6개 (2026-11). 문구·줄바꿈(\n)은 사장님이 준 그대로
 * - key: responses.content 의 칸 이름 (바꾸면 저장 구조가 달라지니 key 는 그대로 두세요)
 * - kind: line 한 줄 입력 / text 여러 줄 입력 / check 체크박스 1개
 * - 1번(retouch_files)만 필수
 */
export type SelectQuestion =
  | { key: "retouch_files" | "review_event_files"; kind: "line"; title: string; desc?: string; required?: boolean; placeholder?: string }
  | { key: "option_files" | "lettering_request" | "retouch_request"; kind: "text"; title: string; desc?: string; placeholder?: string }
  | { key: "sns_consent"; kind: "check"; title: string; desc?: string; checkLabel: string };

export const SELECT_QUESTIONS: readonly SelectQuestion[] = [
  {
    key: "retouch_files",
    kind: "line",
    required: true,
    // 2026-11-18: 다른 질문처럼 대괄호 제목 + 설명. 예전 title: 보정 및 인화를 원하는 사진의 파일명을 알려주세요.(기본 2장)
    title: "[패키지 상품]",
    desc: "보정 및 인화를 원하는 사진의 파일명을 알려주세요.(기본 2장)",
    placeholder: "예: IMG_0012, IMG_0035",
  },
  {
    key: "review_event_files",
    kind: "line",
    title: "[무료보정 이벤트]",
    desc: "네이버 리뷰 등록 시, 1컷을 무료로 보정해서 고화질 원본으로 드립니다.\n이벤트 참여를 원하시면 보정할 사진의 파일명을 적어주세요",
  },
  {
    key: "sns_consent",
    kind: "check",
    title: "[무료 고화질 원본 이벤트]",
    desc: "블루티티 SNS활용 동의 시 무료로 고화질 원본을 제공해드립니다. 참여를 원하실 경우 아래 박스에 체크해주세요",
    checkLabel: "SNS활용에 동의합니다",
  },
  {
    key: "option_files",
    kind: "text",
    title: "[추가 옵션 선택 한 경우]",
    desc: "예약 시 [보정, 인화, 4컷프레임, A3 포스터, 증명/프로필]중 추가 하셨다면 옵션명과 해당하는 파일명을 적어주세요 (예: 4컷프레임/ 20345, 23944, 23525, 34234)",
  },
  {
    key: "lettering_request",
    kind: "text",
    title: "[레터링&드로잉 구매 한 경우]",
    desc: "원하는 레터링 문구를 구매 시 적어주지 않았거나 변경하고 싶다면 적어주세요. (*보정본 1차 확인 후 수정은 1회까지 가능합니다.)",
  },
  {
    key: "retouch_request",
    kind: "text",
    title: "특별히 보정을 원하는 부분을 알려주세요.",
    desc: "(예: 팔을 얇게 수정해주세요 / 여드름을 지워주세요 등)",
  },
];

/** 촬영 후 추가 구매 탭 안내 (위: lead / 합계 아래: 입금 계좌·입금자명) */
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

/**
 * 사진 보관 기간 (이용일 기준, 일). 2026-11: 3개월 → 30일
 * 화면 문구·서버 판단(/api/mypage/bookings)·개인정보처리방침이 이 값을 씀. DB 는 supabase/migrations/002
 */
export const PHOTO_KEEP_DAYS = 30;

/** 원화 콤마 표기: 15000 → "15,000원" */
export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
