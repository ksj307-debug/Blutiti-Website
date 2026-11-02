/**
 * 로고 (public/brand SVG). 텍스트로 재현 금지
 * - tone="navy": 밝은 배경 기본. 다크 테마에서는 ivory 로 자동 전환
 * - tone="ivory": night 섹션·어두운 사진 위
 */
type LogoProps = {
  shape: "horizontal" | "stacked";
  tone?: "navy" | "ivory" | "ink";
  className?: string;
  /** 장식용이면 true (옆에 같은 이름 텍스트·링크 라벨이 있을 때) */
  decorative?: boolean;
};

const LABEL = { horizontal: "BLUTITI SELFIE STUDIO", stacked: "BLUTITI Selfie Studio" };

export function Logo({ shape, tone = "navy", className, decorative }: LogoProps) {
  const src = (t: string) => `/brand/blutiti-${shape}-${t}.svg`;
  return (
    <picture className={`logo ${className ?? ""}`}>
      {tone === "navy" && <source srcSet={src("ivory")} media="(prefers-color-scheme: dark)" />}
      <img src={src(tone)} alt={decorative ? "" : LABEL[shape]} />
    </picture>
  );
}
