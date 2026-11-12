"use client";

import type { MouseEvent, ReactNode } from "react";
import type { PlanId } from "@/lib/concepts";

/** BOOKING 에 필수 선택을 미리 골라 달라는 신호 (components/sections/booking.tsx 가 받음) */
export const PICK_PLAN_EVENT = "blutiti:pick-plan";

/**
 * PRICE 02 카드의 '가성비로 예약하기 / 패키지로 예약하기'
 * - 메인에서는 새로고침 없이 BOOKING 으로 스크롤하면서 필수 선택을 그 플랜으로
 * - 다른 페이지·자바스크립트 없을 때는 /?plan={id}#booking 으로 이동 (BOOKING 이 주소의 plan 을 읽음)
 */
export function PlanBookLink({ plan, className, children }: { plan: PlanId; className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("booking");
    if (!target) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(PICK_PLAN_EVENT, { detail: plan }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    history.replaceState(null, "", "#booking");
  };
  return (
    <a className={className} href={`/?plan=${plan}#booking`} onClick={onClick}>
      {children}
    </a>
  );
}
