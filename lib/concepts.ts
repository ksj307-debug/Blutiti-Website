/**
 * BLUTITI 컨셉 단일 소스
 * CONCEPT 섹션 · PRICE(요금 안내) · BOOKING STEP 1 이 모두 이 목록을 import 해서 사용
 * → 컨셉 이름·순서·가격이 세 곳에서 어긋나지 않게 함
 *
 * 요금 구조: 모든 컨셉 = 컨셉(세부 상품) × 필수 선택(가성비 / 패키지)
 *  - 가성비: 원본 무제한(웹사이즈)
 *  - 패키지: 원본 무제한 + 2컷 보정(수정 1회) + 2장 인화 + 종이액자 우편 발송
 * 금액 = 레퍼런스(_handoff/reference/index.html) '이용 요금' 값 + 확정 지시 (1~2인 기준)
 *  - 100일상: 가성비 79,000원 / 패키지 99,000원
 * amount: null → 결제 대신 카카오톡 문의. 화면 표기는 label, 없으면 '문의'
 *  - 시즌 컨셉: '컨셉 제공 시 안내'
 *  - 증명·프로필 패키지: 금액 미정이라 임시 '문의' (금액 받으면 숫자로 교체)
 *
 * 세이지 포레스트는 베이직 컬러에 통합 (별도 컨셉·가격 없음). 예전 데이터는 LEGACY_CONCEPT_IDS 로 연결
 */

export type ConceptId = "basic-color" | "classic-bw" | "100days" | "id-profile" | "season";
export type PlanId = "value" | "package";

export const PLANS: { id: PlanId; name: string; summary: string; includes: string[]; badge?: string }[] = [
  { id: "value", name: "가성비", summary: "보정·인화 없이 원본만 받는 구성", includes: ["원본 무제한 (웹사이즈)"] },
  {
    id: "package",
    name: "패키지",
    summary: "보정과 인화까지 한 번에",
    badge: "인기",
    includes: ["원본 무제한 (웹사이즈)", "2컷 보정 (수정 1회)", "2장 인화 + 종이액자 우편 발송"],
  },
];

export type PlanPrice = {
  /** 원 단위. null = 문의 */
  amount: number | null;
  /** 정가 (할인 전, 취소선 표기용) */
  listAmount?: number;
  /** amount 가 null 일 때 화면 표기. 없으면 '문의' */
  label?: string;
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
const SEASON_PRICE: PlanPrice = { amount: null, label: "컨셉 제공 시 안내" };

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
    variants: [{ id: "100days", name: "100일상", note: "한복, 돌상 준비", plans: { value: { amount: 79000 }, package: { amount: 99000 } } }],
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
    variants: [{ id: "season", name: "시즌 컨셉", plans: { value: SEASON_PRICE, package: SEASON_PRICE } }],
  },
];

/** 예전 컨셉 id·이름 → 현재 컨셉 id. 저장된 예약·예전 링크는 데이터를 바꾸지 않고 화면 표기만 새 이름 */
export const LEGACY_CONCEPT_IDS: Record<string, ConceptId> = {
  sage: "basic-color",
  "sage-forest": "basic-color",
  "세이지 포레스트": "basic-color",
};

/** 예전 상품명(레퍼런스 '촬영 상품') → 현재 필수 선택. 저장된 예약 표기용 */
export const LEGACY_PRODUCT_PLANS: Record<string, PlanId> = {
  "패키지 셀프촬영": "package",
  "가성비 셀프촬영": "value",
};

/** 저장된 예약의 컨셉·상품 → 화면 표기 '컨셉명 · 가성비/패키지'. 알 수 없으면 저장된 상품명 그대로 */
export const bookingLabel = (concept: string | undefined, product: string) => {
  const c = findConcept(concept);
  const planId = LEGACY_PRODUCT_PLANS[product] ?? PLANS.find((p) => p.id === product || p.name === product)?.id;
  const plan = PLANS.find((p) => p.id === planId);
  if (c && plan) return `${c.name} · ${plan.name}`;
  return c ? `${product} · ${c.name}` : product;
};

/** id·한글명·예전 값 → 현재 컨셉. 모르는 값은 undefined */
export const findConcept = (key: string | null | undefined): Concept | undefined => {
  if (!key) return undefined;
  const id = LEGACY_CONCEPT_IDS[key] ?? key;
  return CONCEPTS.find((c) => c.id === id || c.name === id);
};

/** 세부 상품 id 로 찾기 (예: "profile") */
export const findVariant = (variantId: string) => {
  for (const concept of CONCEPTS) {
    const variant = concept.variants.find((v) => v.id === variantId);
    if (variant) return { concept, variant };
  }
  return undefined;
};

/** 컨셉별 예약 이동 경로: 메인의 BOOKING 섹션으로 이동하면서 STEP 1 을 해당 컨셉으로 미리 선택 */
export const bookingHref = (id: ConceptId) => `/?concept=${id}#booking`;

/** 원화 표기: 45000 → "45,000원" */
export const formatKRW = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/** 가격 표기: 금액 없음(null)은 label 또는 '문의' */
export const priceLabel = (price: PlanPrice) =>
  price.amount === null ? (price.label ?? "문의") : formatKRW(price.amount);

/** 결제 가능 여부: 금액이 '문의'면 결제 대신 카카오톡 문의로 안내 */
export const isPayable = (price: PlanPrice) => price.amount !== null;
