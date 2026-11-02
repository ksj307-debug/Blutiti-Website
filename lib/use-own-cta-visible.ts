"use client";

import { useEffect, useState } from "react";

/** 자체 코발트 예약 버튼이 있는 섹션 표시 (히어로, CONCEPT 등) */
export const OWN_CTA = "[data-hero], [data-own-cta]";

/**
 * 자체 예약 버튼이 있는 섹션이 하나라도 화면에 보이는지
 * 헤더·모바일 하단 바의 '예약하기'를 그동안 보조 버튼으로 바꿔 한 화면 코발트 한 곳을 지킴
 * @param topOffset 화면 위쪽에서 가려지는 높이 (고정 헤더)
 */
export function useOwnCtaVisible(topOffset = 0) {
  // 메인 첫 화면은 히어로가 보이는 상태로 시작. 해당 섹션이 없는 페이지에서는 관찰 결과로 false 가 됨
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const showing = new Set<Element>();
    const watched = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) showing.add(e.target);
          else showing.delete(e.target);
        }
        setVisible(showing.size > 0);
      },
      { rootMargin: `-${topOffset}px 0px 0px 0px` },
    );
    const watch = () => {
      document.querySelectorAll(OWN_CTA).forEach((z) => {
        if (watched.has(z)) return;
        watched.add(z);
        io.observe(z);
      });
    };
    watch();
    // 나중에 스트리밍되는 영역(예: 예약 조회)도 관찰
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    // 관찰 대상이 없으면 첫 콜백이 오지 않으므로 다음 프레임에 false 로
    const frame = watched.size ? 0 : requestAnimationFrame(() => setVisible(showing.size > 0));
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [topOffset]);

  return visible;
}
