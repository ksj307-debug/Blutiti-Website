import { PLANS, findVariant, type ConceptId, type PlanId, type PlanPrice } from "@/lib/concepts";

/**
 * 레퍼런스 '촬영 상품' 목록 (PRICE · BOOKING 임시 구조)
 * 금액은 lib/concepts.ts 에서 가져옴 → 가격 하드코딩 없음
 * 미사용: 6·7단계에서 PRICE·BOOKING 이 '컨셉 × 가성비/패키지'(lib/concepts.ts) 구조로 바뀜.
 * 보관용 components/sections/price-reference.tsx 만 참조
 */
const price = (variantId: string, plan: PlanId): PlanPrice => {
  const found = findVariant(variantId);
  if (!found) throw new Error(`unknown variant: ${variantId}`);
  return found.variant.plans[plan];
};

export type Product = {
  id: string;
  name: string;
  /** BOOKING 선택지 표기 (없으면 name) */
  shortName?: string;
  price: PlanPrice;
  /** BOOKING 선택지 보조 문구 */
  note: string;
  /** PRICE 목록 설명 */
  desc: string;
  tag?: string;
  /** 베이직 컬러·클래식 흑백 중 컨셉 선택이 필요한 상품 */
  withConcept?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "pkg",
    name: "패키지 셀프촬영",
    price: price("basic-color", "package"),
    note: "보정 2컷 · 인화 2장",
    desc: PLANS.find((p) => p.id === "package")!.includes.join(" · "),
    tag: "추천",
    withConcept: true,
  },
  {
    id: "val",
    name: "가성비 셀프촬영",
    price: price("basic-color", "value"),
    note: "원본 무제한",
    desc: "패키지에서 보정·인화를 뺀 구성, 원본 무제한 제공",
    withConcept: true,
  },
  { id: "100", name: "100일상 셀프촬영", price: price("100days", "value"), note: "한복 · 돌상", desc: "한복, 돌상 준비" },
  { id: "pro", name: "프로필 셀프촬영", price: price("profile", "value"), note: "셀렉은 집에서", desc: "셀렉은 집에서" },
  {
    id: "id",
    name: "증명·여권사진 셀프촬영",
    shortName: "증명·여권사진",
    price: price("id-photo", "value"),
    note: "30분 촬영",
    desc: "30분 촬영, 당일 인화 불가",
  },
];

/** 패키지·가성비 상품에서 고를 수 있는 컨셉 (세이지 포레스트는 베이직 컬러에 통합) */
export const PRODUCT_CONCEPTS: ConceptId[] = ["basic-color", "classic-bw"];
