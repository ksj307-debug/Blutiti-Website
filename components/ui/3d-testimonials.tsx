/**
 * Marquee (원본: 21st.dev 3d-testimonails.tsx)
 * 원본 대비 수정 사항
 * - 'use client' 불필요 (훅 없이 CSS 애니메이션만 사용) → useRef·useMemo 제거
 * - 움직임 줄이기(prefers-reduced-motion) 설정이면 애니메이션 정지 (globals.css)
 * - 복제된 줄(2번째부터)은 inert: 스크린리더가 반복해서 읽지 않고 탭 이동에서도 빠짐
 * - role 기본값 marquee 유지, 키보드 포커스 시에도 일시정지(pauseOnHover)
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  /** 반대 방향으로 흐름 */
  reverse?: boolean;
  /** 마우스를 올리거나 포커스하면 멈춤 */
  pauseOnHover?: boolean;
  children: ReactNode;
  /** 세로로 흐름 */
  vertical?: boolean;
  /** 내용 반복 횟수 (끊김 없는 루프용) */
  repeat?: number;
  ariaLabel?: string;
  ariaLive?: "off" | "polite" | "assertive";
  ariaRole?: string;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ariaLabel,
  ariaLive = "off",
  ariaRole = "marquee",
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaRole}
      tabIndex={0}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          // 복제 줄: 스크린리더·키보드 탭 이동에서 제외 (원본 한 줄만 읽힘)
          inert={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
