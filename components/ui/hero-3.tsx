"use client";

/**
 * BLUTITI 히어로 (원본: 21st.dev AnimatedMarqueeHero 보완판)
 * 디자인 기준: _handoff/design-system (BLUTITI 디자인 시스템) — styles/blutiti-tokens.css 필요
 *
 * 원본 대비 수정 사항
 * - 이미지: string[] → { src, alt }[]  (로컬 사진 + 한국어 alt)
 * - 마키 루프 버그 수정: 원본 x: -100% → 0% 는 한 바퀴마다 끊김
 *   → w-max + x: -50% → 0%, gap 대신 아이템별 padding 으로 이음새 없이 반복
 * - 텍스트 딜레이 버그 수정: variants 를 함수형(custom)으로 바꿔 delay 전달
 * - CTA: <button> → <a href>, 디자인 시스템 버튼(btn-primary 코발트 pill / btn-secondary ink 테두리)
 * - 디자인 시스템 반영: 태그라인 = eyebrow(IBM Plex Mono), 한글 제목 = heading-kr-lg(고운바탕 400),
 *   영문 대문자 헤드라인(display, 선택), 사진 radius-0 · 그림자 없음 · 회전 없음(에디토리얼 톤)
 * - 모바일: min-h-[100svh], 하단 마키와 텍스트가 겹치지 않도록 여백 확보
 * - 접근성: prefers-reduced-motion 이면 마키 정지, 복제된 두 번째 줄은 aria-hidden
 */

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sentences } from "@/components/site/sentences";

export type HeroImage = {
  /** public/ 기준 경로. 예: "/images/hero/family-01.webp" */
  src: string;
  /** 사진 설명 (한국어). 예: "가족 컨셉 - 아이를 안고 웃는 부부" */
  alt: string;
};

export interface AnimatedMarqueeHeroProps {
  /** 상단 라벨 (eyebrow) */
  tagline: string;
  /** 영문 대문자 헤드라인 (선택). 이탤릭 연결어는 <em> 으로 */
  display?: React.ReactNode;
  /** 한글 제목 */
  title: React.ReactNode;
  description: string;
  ctaText: string;
  /** CTA 이동 경로. 기본 "#booking" */
  ctaHref?: string;
  /** 보조 버튼 (선택) */
  secondaryText?: string;
  secondaryHref?: string;
  images: HeroImage[];
  /** 마키 한 바퀴 시간(초). 기본 60 */
  speed?: number;
  className?: string;
}

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, delay },
  }),
};

export function AnimatedMarqueeHero({
  tagline,
  display,
  title,
  description,
  ctaText,
  ctaHref = "#booking",
  secondaryText,
  secondaryHref,
  images,
  speed = 60,
  className,
}: AnimatedMarqueeHeroProps) {
  const reduceMotion = useReducedMotion();
  const loop = [...images, ...images];

  return (
    <section
      id="top"
      // 헤더 '예약하기' 버튼이 히어로 노출 여부를 판단하는 기준
      data-hero
      className={cn(
        "relative w-full min-h-[100svh] overflow-hidden bg-[var(--paper-100)] text-[var(--ink)]",
        "flex flex-col items-center justify-center px-4 pt-16 pb-[42svh] text-center md:pt-20 md:pb-[44vh]",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center">
        <motion.p initial="hidden" animate="show" variants={FADE_UP} custom={0} className="t-eyebrow mb-6 text-[var(--ink-muted)]">
          {tagline}
        </motion.p>

        {display && (
          <motion.p initial="hidden" animate="show" variants={FADE_UP} custom={0.1} className="t-display-xl mb-4">
            {display}
          </motion.p>
        )}

        <motion.h1 initial="hidden" animate="show" variants={FADE_UP} custom={0.2} className="t-heading-kr-lg [text-wrap:balance] break-keep">
          {title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          custom={0.45}
          className="t-body mt-5 max-w-xl break-keep text-[var(--ink-muted)]"
        >
          <Sentences text={description} />
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          custom={0.6}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <a href={ctaHref} className="btn-primary">
            {ctaText}
          </a>
          {secondaryText && secondaryHref && (
            <a href={secondaryHref} className="btn-secondary">
              {secondaryText}
            </a>
          )}
        </motion.div>
      </div>

      {/* 하단 이미지 마키 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38svh] md:h-[40vh] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_88%,transparent)]">
        <motion.div
          className="flex h-full w-max items-center"
          animate={reduceMotion ? undefined : { x: ["-50%", "0%"] }}
          transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        >
          {loop.map((img, index) => {
            const isCopy = index >= images.length;
            return (
              <figure key={index} aria-hidden={isCopy || undefined} className="m-0 h-48 flex-shrink-0 pr-4 md:h-64 md:pr-6">
                <img
                  src={img.src}
                  alt={isCopy ? "" : img.alt}
                  loading={index < 6 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="aspect-[4/5] h-full w-auto object-cover"
                />
              </figure>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default AnimatedMarqueeHero;
