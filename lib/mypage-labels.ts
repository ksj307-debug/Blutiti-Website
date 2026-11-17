/**
 * My Page 상품 표시 (목록 행·상세 화면 공용, 판단 로직은 이 파일 한 곳)
 * 표시 형식: '베이직 컬러 · 패키지'
 * - 컨셉명: product 의 한글 부분만 ('베이직 컬러(Basic Color)' → '베이직 컬러')
 * - 구분: options 에 '가성비 셀프촬영' → 가성비, '패키지 셀프촬영' → 패키지. 둘 다 없으면 컨셉명만
 */
export type PlanKind = "가성비" | "패키지";

/** 괄호 속 영문 등을 빼고 한글 컨셉명만 */
export function conceptName(product: string | null): string {
  if (!product) return "";
  return product
    .replace(/\s*[(（][^)）]*[)）]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function planKind(options: string | null): PlanKind | null {
  if (!options) return null;
  if (options.includes("가성비 셀프촬영")) return "가성비";
  if (options.includes("패키지 셀프촬영")) return "패키지";
  return null;
}

/** '베이직 컬러 · 패키지' (구분이 없으면 컨셉명만, 컨셉명도 없으면 빈 문자열) */
export function productLabel(product: string | null, options: string | null): string {
  const name = conceptName(product);
  const kind = planKind(options);
  if (!name) return kind ?? "";
  return kind ? `${name} · ${kind}` : name;
}
