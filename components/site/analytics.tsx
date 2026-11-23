"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GA_CLICK_EVENTS, GA_ID, isPrivatePath } from "@/lib/analytics";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

/** gtag 대기열 준비 (gtag.js 가 늦게 와도 먼저 쌓아 둔 명령을 순서대로 처리) — 한 번만 */
let initialized = false;
function initGtag() {
  if (initialized) return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js 는 arguments 객체 그대로를 받아야 해요
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // 페이지 조회는 아래 sendPageView 가 직접 보냄 (자동 전송 끔)
  window.gtag("config", GA_ID, { send_page_view: false });
}

/** 같은 주소를 연달아 두 번 보내지 않게 (개발 모드의 effect 두 번 실행 등) */
let lastSent = "";
function sendPageView(pathname: string) {
  if (lastSent === pathname || !window.gtag) return;
  lastSent = pathname;
  window.gtag("event", "page_view", {
    page_location: `${window.location.origin}${pathname}`,
    page_path: pathname,
    page_title: document.title,
  });
}

/**
 * 구글 애널리틱스(GA4) — 루트 레이아웃에 한 번 (Suspense 안)
 * - 처음 연 화면이 고객 전용(/mypage 등)이면 GA 스크립트를 아예 불러오지 않음
 * - 공개 페이지로 오면 그때 불러오고, 고객 전용 화면에 있는 동안에는 window['ga-disable-ID'] 로 전송을 막음
 * - page_view 는 주소가 바뀔 때마다 한 번 (주소 뒤 ?·# 는 빼고)
 * - 예약·문의 버튼 클릭은 lib/analytics.ts GA_CLICK_EVENTS 선택자로 한 곳에서 기록
 */
export function Analytics() {
  const pathname = usePathname();
  const isPrivate = isPrivatePath(pathname);
  const [load, setLoad] = useState(!isPrivate);

  // 고객 전용 화면에서는 전송 차단, 공개 화면으로 오면 스크립트 로드 + 페이지 조회 기록
  useEffect(() => {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = isPrivate;
    if (isPrivate) {
      lastSent = "";
      return;
    }
    initGtag();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoad(true);
    sendPageView(pathname);
  }, [pathname, isPrivate]);

  // 버튼 클릭 이벤트 (문서 전체에서 한 번만 듣고, 선택자에 맞을 때만 전송)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (isPrivatePath(window.location.pathname)) return;
      const target = e.target as Element | null;
      for (const ev of GA_CLICK_EVENTS) {
        if (target?.closest(ev.selector)) {
          window.gtag?.("event", ev.name, ev.params);
          return;
        }
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!load) return null;
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />;
}
