"use client";

import { useEffect, useState } from "react";

/**
 * 맨 위로 버튼 (오른쪽 아래 고정)
 * - 히어로([data-hero])를 지나 스크롤하면 나타남. 히어로가 없는 페이지는 한 화면 높이를 지나면
 * - 동작 줄이기 설정이면 부드러운 스크롤 없이 바로 이동
 * - 코발트 없음 (예약 동작 전용). 모바일 하단 바 위, 메뉴 drawer·사진 팝업보다 아래 층 (site.css .to-top)
 */
export function ToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const line = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      setShow(window.scrollY > line);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <button type="button" className="to-top" data-show={show || undefined} aria-label="맨 위로" onClick={toTop}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 15V3M4 8l5-5 5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
