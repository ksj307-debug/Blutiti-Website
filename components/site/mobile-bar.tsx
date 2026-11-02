"use client";

import Link from "next/link";
import { KakaoChatButton } from "@/components/site/kakao";
import { BOOKING_HREF } from "@/lib/nav";
import { useOwnCtaVisible } from "@/lib/use-own-cta-visible";

/** 모바일 하단 고정 바 (860px 이하). 자체 예약 버튼이 있는 섹션이 보이는 동안 '예약하기'는 보조 버튼 */
export function MobileBar() {
  const ownCtaVisible = useOwnCtaVisible(MOBILE_HEADER_H);
  return (
    <div className="bar" role="navigation" aria-label="빠른 메뉴">
      <KakaoChatButton className="btn">카카오톡 문의</KakaoChatButton>
      <Link className={ownCtaVisible ? "btn" : "btn btn-primary"} href={BOOKING_HREF}>
        예약하기
      </Link>
    </div>
  );
}

const MOBILE_HEADER_H = 57;
