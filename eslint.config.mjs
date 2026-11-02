import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 레퍼런스 사진은 CSS 비율 크롭(aspect-ratio + object-fit)을 그대로 쓰기 위해 <img> 사용.
    // 3·5단계에서 webp 로 교체할 때 next/image 전환 검토
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 핸드오프 원본 (참고용, 빌드 대상 아님)
    "_handoff/**",
  ]),
]);

export default eslintConfig;
