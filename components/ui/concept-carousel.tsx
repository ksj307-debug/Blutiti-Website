"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

/**
 * 같은 크기 카드가 나란히 놓인 가로 캐러셀 (CONCEPTS · FOR YOU 공용)
 * - 한 화면 장수(perView)는 모바일·태블릿·데스크톱별로 지정 + 다음 카드 10% 정도 보임 (폭 계산은 site.css .cc-*)
 * - 자동 넘김 없음, 끝에서 반복 없음 (끝에 닿은 쪽 화살표는 숨김)
 * - 화살표: 캐러셀 왼쪽·오른쪽 끝, 세로는 사진 영역의 가운데 (카드 안 [data-cc-photo] 기준)
 * - 이동: 화살표(한 장씩), 터치 스와이프(카드 단위 스냅), 키보드 좌우 화살표
 * - 동작 줄이기 설정이면 부드러운 스크롤 없이 바로 이동
 * 이전 버전: carousel-squeeze.tsx (스퀴즈), ui/carousel.tsx (embla) — 미사용으로 보관
 */
export function ConceptCarousel({
  label,
  head,
  perView = { mobile: 1, tablet: 2, desktop: 4 },
  children,
}: {
  label: string;
  head: ReactNode;
  perView?: { mobile: number; tablet: number; desktop: number };
  children: ReactNode[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  /** 화살표 세로 위치: 트랙 위에서 사진 가운데까지 (px). 측정 전에는 CSS 기본값 */
  const [arrowY, setArrowY] = useState<number | null>(null);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    const photo = el.querySelector<HTMLElement>("[data-cc-photo]");
    if (photo) {
      const t = el.getBoundingClientRect();
      const p = photo.getBoundingClientRect();
      setArrowY(Math.round(p.top - t.top + p.height / 2));
    }
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

  const style = {
    "--cc-n-m": perView.mobile,
    "--cc-n-t": perView.tablet,
    "--cc-n-d": perView.desktop,
    ...(arrowY !== null ? { "--cc-arrow-y": `${arrowY}px` } : {}),
  } as CSSProperties;

  return (
    <div className="cc" role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown} style={style}>
      <div className="cc-head">{head}</div>
      <div className="cc-stage">
        {/* tabIndex: 트랙에 포커스해도 좌우 화살표로 이동 */}
        <ul className="cc-track" ref={trackRef} tabIndex={0} aria-label={`${label} 목록`}>
          {children.map((child, i) => (
            <li className="cc-item" key={i} aria-roledescription="slide" aria-label={`${i + 1} / ${children.length}`}>
              {child}
            </li>
          ))}
        </ul>
        <Arrow back hidden={!canPrev} onClick={() => move(-1)} />
        <Arrow hidden={!canNext} onClick={() => move(1)} />
      </div>
    </div>
  );
}

/** 원형 화살표: paper 배경 + ink 1px 테두리, 사진 가장자리에 반쯤 걸침. 끝에 닿으면 숨김 */
function Arrow({ back, hidden, onClick }: { back?: boolean; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`cc-arrow ${back ? "cc-arrow-prev" : "cc-arrow-next"}`}
      aria-label={back ? "이전" : "다음"}
      hidden={hidden}
      onClick={onClick}
    >
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
