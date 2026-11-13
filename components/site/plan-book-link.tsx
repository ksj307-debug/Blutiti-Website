"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import type { PlanId } from "@/lib/concepts";

/** 미사용(자체 예약 중단): BOOKING 에 필수 선택을 미리 골라 달라는 신호 (예전 LegacyBooking 이 받음) */
export const PICK_PLAN_EVENT = "blutiti:pick-plan";

/**
 * PRICE 02 카드의 '가성비로 예약하기 / 패키지로 예약하기' → BOOKING 섹션(예약 채널 안내)으로 부드럽게 이동
 * 2026-11 자체 예약 중단으로 플랜 미리 선택은 끊음. 예전: PICK_PLAN_EVENT 를 보내고 /?plan={id}#booking 으로 이동
 * (plan 값은 예전 호출부와 맞추려고 받기만 함)
 */
export function PlanBookLink({ className, children }: { plan: PlanId; className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("booking");
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    history.replaceState(null, "", "#booking");
  };
  return (
    <Link className={className} href="/#booking" onClick={onClick}>
      {children}
    </Link>
  );
}
