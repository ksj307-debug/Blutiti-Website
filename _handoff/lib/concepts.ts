/**
 * BLUTITI 컨셉 단일 소스
 * CONCEPT 섹션 · PRICE(요금 안내) · BOOKING STEP 1 이 모두 이 목록을 import 해서 사용
 * → 컨셉 이름·순서·가격이 세 곳에서 어긋나지 않게 함
 *
 * 요금 구조: 모든 컨셉 = 컨셉(세부 상품) × 필수 선택(가성비 / 패키지)
 *  - 가성비: 원본 무제한(웹사이즈)
 *  - 패키지: 원본 무제한 + 2컷 보정(수정 1회) + 2장 인화 + 종이액자 우편 발송
 * 금액 = 레퍼런스(_handoff/reference/index.html) '이용 요금' 값 (1~2인 기준)
 * amount: null → 화면 표기 '문의'
 *  - 시즌 컨셉: 확정 '문의'
 *  - 100일상·증명·프로필 패키지: 금액 미정이라 임시 '문의' (금액 받으면 숫자로 교체)
 */

export type ConceptId = "basic-color" | "classic-bw" | "100days" | "id-profile" | "season";
export type PlanId = "value" | "package";

export const PLANS: { id: PlanId; name: string; includes: string[]; badge?: string }[] = [
  { id: "value", name: "가성비", includes: ["원본 무제한 (웹사이즈)"] },
  {
    id: "package",
    name: "패키지",
    badge: "인기",
    includes: ["원본 무제한 (웹사이즈)", "2컷 보정 (수정 1회)", "2장 인화 + 종이액자 우편 발송"],
  },
];

export type PlanPrice = {
  /** 원 단위. null = 문의 */
  amount: number | null;
  /** 정가 (할인 전, 취소선 표기용) */
  listAmount?: number;
};

/** 세부 상품. 대부분 컨셉은 1개, 증명·프로필은 2개 */
export type ConceptVariant = {
  id: string;
  /** 세부 상품명. 컨셉명과 같으면 화면에서 생략 */
  name: string;
  /** 촬영 시간 등 비고 */
  note?: string;
  plans: Record<PlanId, PlanPrice>;
};

export type Concept = {
  id: ConceptId;
  /** 한글명 (화면 표기) */
  name: string;
  /** 영문 라벨 (캐러셀 오버레이) */
  label: string;
  /** 세부 테마 (시즌 컨셉 전용) */
  themes?: string[];
  variants: ConceptVariant[];
};

const INQUIRY: PlanPrice = { amount: null };

export const CONCEPTS: Concept[] = [
  {
    id: "basic-color",
    name: "베이직 컬러",
    label: "BASIC COLOR",
    variants: [{ id: "basic-color", name: "베이직 컬러", plans: { value: { amount: 59000 }, package: { amount: 89000, listAmount: 99000 } } }],
  },
  {
    id: "classic-bw",
    name: "클래식 흑백",
    label: "CLASSIC B&W",
    variants: [{ id: "classic-bw", name: "클래식 흑백", plans: { value: { amount: 59000 }, package: { amount: 89000, listAmount: 99000 } } }],
  },
  {
    id: "100days",
    name: "100일상",
    label: "100 DAYS",
    variants: [{ id: "100days", name: "100일상", note: "한복, 돌상 준비", plans: { value: { amount: 79000 }, package: INQUIRY } }],
  },
  {
    id: "id-profile",
    name: "증명·프로필",
    label: "ID · PROFILE",
    variants: [
      { id: "id-photo", name: "증명·여권", note: "30분 촬영, 당일 인화 불가", plans: { value: { amount: 25000 }, package: INQUIRY } },
      { id: "profile", name: "프로필", note: "셀렉은 집에서", plans: { value: { amount: 55000 }, package: INQUIRY } },
    ],
  },
  {
    id: "season",
    name: "시즌 컨셉",
    label: "SEASON",
    themes: ["졸업", "크리스마스"],
    variants: [{ id: "season", name: "시즌 컨셉", plans: { value: INQUIRY, package: INQUIRY } }],
  },
];

/** 컨셉별 예약 이동 경로: 메인의 BOOKING 섹션으로 이동하면서 STEP 1 을 해당 컨셉으로 미리 선택 */
export const bookingHref = (id: ConceptId) => `/?concept=${id}#booking`;

/** 원화 표기: 45000 → "45,000원" */
export const formatKRW = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/** 가격 표기: 금액 없음(null)은 '문의' */
export const priceLabel = (amount: number | null) => (amount === null ? "문의" : formatKRW(amount));

/** 결제 가능 여부: 금액이 '문의'면 결제 대신 카카오톡 문의로 안내 */
export const isPayable = (price: PlanPrice) => price.amount !== null;
