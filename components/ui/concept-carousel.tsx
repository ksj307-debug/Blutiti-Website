"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * 같은 크기 카드가 나란히 놓인 가로 캐러셀 (CONCEPTS)
 * - 데스크톱 4장 / 태블릿 2장 / 모바일 1장 + 다음 카드 10% 정도 보임 (폭 계산은 site.css .cc-*)
 * - 자동 넘김 없음, 끝에서 반복 없음 (처음엔 '이전', 끝에선 '다음' 비활성)
 * - 이동: 오른쪽 위 화살표(한 장씩), 터치 스와이프(카드 단위 스냅), 키보드 좌우 화살표
 * - 동작 줄이기 설정이면 부드러운 스크롤 없이 바로 이동
 * 이전 버전: carousel-squeeze.tsx (스퀴즈), ui/carousel.tsx (embla) — 미사용으로 보관
 */
export function ConceptCarousel({ label, head, children }: { label: string; head: ReactNode; children: ReactNode[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [sync]);

  /** 한 장 = 카드 폭 + 간격 */
  const move = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "instant" : "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  };

  return (
    <div className="cc" role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      <div className="cc-head">
        {head}
        <span className="cc-arrows">
          <Arrow back disabled={!canPrev} onClick={() => move(-1)} />
          <Arrow disabled={!canNext} onClick={() => move(1)} />
        </span>
      </div>
      {/* tabIndex: 트랙에 포커스해도 좌우 화살표로 이동 */}
      <ul className="cc-track" ref={trackRef} tabIndex={0} aria-label={`${label} 목록`}>
        {children.map((child, i) => (
          <li className="cc-item" key={i} aria-roledescription="slide" aria-label={`${i + 1} / ${children.length}`}>
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 1px 테두리 원형 화살표 (사이트 보조 버튼 톤) */
function Arrow({ back, disabled, onClick }: { back?: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="cc-arrow" aria-label={back ? "이전" : "다음"} disabled={disabled} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={back ? "M13 8H3m4-4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
