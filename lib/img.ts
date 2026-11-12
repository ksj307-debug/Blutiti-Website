/**
 * 반응형 사진 srcset (모바일 우선: 화면 표시 크기의 2배 해상도까지만 받게)
 * - 작은 폭 사본은 원본 옆에 `이름-w{폭}.webp` 로 있음 (scratchpad make-variants 로 생성)
 * - sizes 와 함께 쓰면 브라우저가 화면 폭·레티나 배율에 맞는 가장 작은 파일을 고름
 *
 * 예) srcSet("/images/hero/a.webp", [480, 640], 900)
 *   → "/images/hero/a-w480.webp 480w, /images/hero/a-w640.webp 640w, /images/hero/a.webp 900w"
 */
export function srcSet(src: string, variants: number[], srcWidth: number, extra?: [string, number][]) {
  const list: [string, number][] = [
    ...variants.map((w) => [src.replace(/\.webp$/, `-w${w}.webp`), w] as [string, number]),
    [src, srcWidth],
    ...(extra ?? []),
  ];
  return list.map(([s, w]) => `${s} ${w}w`).join(", ");
}

/** 화면별 표시 폭 (sizes). site.css 레이아웃과 맞춤 */
export const SIZES = {
  /** 히어로 하단 사진 마키: 높이 299·399px × 4:5 */
  hero: "(min-width: 768px) 319px, 239px",
  /** CONCEPTS 카드: 모바일 1장·태블릿 2장·데스크톱 4장 + 다음 카드 10% */
  concept: "(max-width: 639px) calc((100vw - 48px) / 1.1), (max-width: 1023px) calc((100vw - 80px) / 2.1), 270px",
  /** FOR YOU 카드: 모바일·태블릿 가로 스크롤, 데스크톱 4열 */
  forYou: "(max-width: 980px) 220px, 270px",
  /** GALLERY 메이슨리: 모바일 2열, 데스크톱 3열 */
  gallery: "(max-width: 600px) calc((100vw - 48px) / 2), (max-width: 1023px) calc((100vw - 80px) / 3), 360px",
} as const;
