"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { KakaoChatButton } from "@/components/site/kakao";
import { BOOKING_HREF } from "@/lib/nav";

/**
 * 화면 아래 고정 바: '예약하기' · '카카오톡 문의하기' (모바일·PC 모든 페이지, 루트 레이아웃에 한 번)
 * - 차분한 뉴트럴 톤: 예약하기 = ink 면 + paper 글자 / 카카오톡 문의하기 = ink 1px 테두리
 *   (이 바는 사용자 지시로 '코발트는 예약 동작에' 규칙의 예외. 코발트·카카오 노랑 쓰지 않음)
 * - 아이폰 홈바(safe-area) 만큼 아래 여백. 바 높이만큼 body 아래 여백을 둬 푸터를 가리지 않음 (site.css --cta-bar-h)
 * - 링크: 예약하기 = 메인 BOOKING 섹션(/#booking, 메인에서는 부드럽게 스크롤) / 카카오톡 = 채널 채팅(KakaoChatButton)
 * 예전: 오른쪽 아래 카카오 노란 원형 버튼(FloatingActions) → 이 바로 대체. 860px 이하 전용 MobileBar(mobile-bar.tsx)는 미사용 보관
 */
export function BottomBar() {
  // 메인인지는 누를 때 주소로 판단 (usePathname 을 쓰면 동적 주소 페이지에서 Suspense 가 필요해짐)
  const toBooking = (e: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== "/") return;
    const target = document.getElementById("booking");
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#booking");
  };

  return (
    <nav className="cta-bar" aria-label="예약·문의">
      <div className="cta-bar-inner">
        <Link className="cta-btn cta-book" href={BOOKING_HREF} onClick={toBooking}>
          예약하기
        </Link>
        <KakaoChatButton className="cta-btn cta-kakao">
          <KakaoBubbleIcon />
          카카오톡 문의하기
        </KakaoChatButton>
      </div>
    </nav>
  );
}

/** 카카오톡 말풍선 (단색, 글자색과 같은 currentColor) */
function KakaoBubbleIcon() {
  return (
    <svg className="cta-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.66 1.75 5 4.4 6.33l-.9 3.3a.4.4 0 0 0 .6.45l3.9-2.58c.48.05.98.08 1.5.08 5.25 0 9.5-3.36 9.5-7.5S17.25 3.5 12 3.5Z" />
    </svg>
  );
}
