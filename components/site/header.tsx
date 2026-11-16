"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { KakaoChatButton } from "@/components/site/kakao";
import { BOOKING_HREF, MAIN_NAV, MYPAGE_HREF } from "@/lib/nav";

/**
 * 상단 고정 헤더
 * - 메뉴 클릭: 메인에서는 해당 섹션으로 부드럽게 스크롤, 다른 페이지에서는 메인의 해당 섹션으로 이동
 * - 스크롤 위치에 따라 현재 섹션 메뉴 표시 (aria-current)
 * - 한 줄 배치, 로고는 화면 정중앙 (좌우 칸 1fr 로 폭을 맞춤)
 *   데스크톱: 왼쪽 메뉴 / 가운데 가로형 로고 / 오른쪽 사람 아이콘(마이페이지)
 *   모바일: 왼쪽 햄버거 / 가운데 세로형 로고 / 오른쪽 사람 아이콘(마이페이지)
 *   (예약하기·카카오톡 문의는 화면 아래 고정 바 components/site/bottom-bar.tsx)
 * - (숨김) '예약하기'는 항상 코발트(.btn-primary), /mypage 에서는 보조 버튼(.btn-secondary). 지금은 SHOW_HEADER_BOOKING = false
 *   (예전: 히어로·[data-own-cta] 가 보이면 보조 버튼으로 바뀜 → 사용자 지시로 제거)
 * - 모바일 메뉴: 섹션 메뉴 → 구분선 → 카카오톡 문의 → My Page(마이페이지)
 */
/** 메뉴에 없는 섹션: 여기에 닿으면 현재 메뉴 표시 해제 */
const SPY_STOPS = ["booking"];
/** 헤더 오른쪽 '예약하기': 화면 아래 고정 바로 옮겨 숨김 (코드는 유지) */
const SHOW_HEADER_BOOKING = false;

/** 사람 모양 1px 라인 아이콘 (디자인 시스템: 아이콘은 1px 라인, ink) */
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <circle cx="11" cy="7.5" r="3.75" />
      <path d="M3.75 19.25c.9-3.6 3.75-5.75 7.25-5.75s6.35 2.15 7.25 5.75" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isMypage = pathname === "/mypage" || pathname.startsWith("/mypage/");
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // 실제 헤더 높이 → --header-h (섹션 scroll-margin-top, 예약 요약 sticky 위치에 사용)
  // 모바일 메뉴가 열려도 값이 바뀌지 않게 메뉴 줄(top-bar) + 하단 헤어라인만 잼
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const sync = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight + 1}px`);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  // 모바일 메뉴가 열려 있는 동안 오른쪽 아래 고정 버튼(맨 위로·카카오톡)을 숨김 (site.css html[data-menu-open])
  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open);
    return () => document.documentElement.removeAttribute("data-menu-open");
  }, [open]);

  // 스크롤 위치 → 현재 섹션
  useEffect(() => {
    if (!isHome) return;
    const ids = [...MAIN_NAV.map((n) => n.id), ...SPY_STOPS];
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = (headerRef.current?.offsetHeight ?? 0) + window.innerHeight * 0.3;
      let current: string | null = null;
      let best = -Infinity;
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current && !SPY_STOPS.includes(current) ? current : null);
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
  }, [isHome]);

  /** 메인 안에서는 Next 라우팅 없이 섹션으로 부드럽게 스크롤 */
  const scrollTo = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (!isHome) return;
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (id === "top") window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: "start" });
    history.replaceState(null, "", id === "top" ? "/" : `#${id}`);
  };

  const current = isHome ? active : null;

  return (
    <header className="top" ref={headerRef}>
      <div className="wrap top-bar" ref={barRef}>
        <button
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span className="sr">메뉴</span>
        </button>
        {/*
          로고 하나만 불러오기 (<picture> 가 화면 폭에 맞는 파일 1개만 받음)
          - 1024px 미만: 기존 세로형 SVG 그대로 (navy, 다크 테마 ivory, 높이 36px)
          - 1024px 이상: 새 가로형 PNG (public/brand/logo-horizontal.png, 1180x122, navy 한 가지)
          예전: <Logo shape="horizontal" className="logo-h" /> + <Logo shape="stacked" className="logo-s" /> 두 개를 CSS 로 숨김
               (숨긴 쪽 파일도 내려받음). Logo 컴포넌트·가로형 SVG 는 푸터 등에서 그대로 사용
        */}
        <Link className="brand" href="/" onClick={scrollTo("top")}>
          <picture className="logo logo-s header-logo">
            <source media="(min-width: 1024px)" srcSet="/brand/logo-horizontal.png" width={1180} height={122} />
            <source media="(prefers-color-scheme: dark)" srcSet="/brand/blutiti-stacked-ivory.svg" />
            <img src="/brand/blutiti-stacked-navy.svg" alt="BLUTITI SELFIE STUDIO" />
          </picture>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.id}
              href={`/#${item.id}`}
              aria-current={current === item.id ? "true" : undefined}
              onClick={scrollTo(item.id)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="top-actions">
          {/* 예전 '로그인'(예약 조회) 버튼: 2026-11 자체 예약 중단으로 화면에서 뺌
              <Link className="btn-secondary top-login" href={LOGIN_HREF}>로그인</Link> */}
          {/* 마이페이지: 사람 아이콘 (모바일·PC 공통, 누르는 영역 44px, 햄버거와 같은 ink 1px 선)
              예전: 데스크톱만 '내 사진' 테두리 버튼(className="btn-secondary top-login") */}
          <Link
            className="top-mypage"
            href={MYPAGE_HREF}
            aria-label="My Page"
            aria-current={isMypage ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <PersonIcon />
          </Link>
          {/* '예약하기'는 화면 아래 고정 바(BottomBar)로 옮겨 헤더에서는 숨김 (SHOW_HEADER_BOOKING = true 면 다시 보임)
              마이페이지에서는 제출 버튼이 그 화면의 코발트라 보조 버튼(ink 테두리)으로 */}
          {SHOW_HEADER_BOOKING && (
            <Link
              className={isMypage ? "btn-secondary" : "btn-primary"}
              href={BOOKING_HREF}
              onClick={scrollTo("booking")}
            >
              예약하기
            </Link>
          )}
        </div>
      </div>
      <div className="drawer" id="drawer" hidden={!open}>
        {MAIN_NAV.map((item) => (
          <Link
            key={item.id}
            href={`/#${item.id}`}
            aria-current={current === item.id ? "true" : undefined}
            onClick={scrollTo(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.sub}</small>
          </Link>
        ))}
        <div className="drawer-sep" role="separator" />
        <KakaoChatButton className="drawer-kakao">
          <span className="kr">카카오톡 문의</span>
          <small>채널 &apos;블루티티&apos;</small>
        </KakaoChatButton>
        <Link href={MYPAGE_HREF} aria-current={isMypage ? "page" : undefined} onClick={() => setOpen(false)}>
          <span className="kr">My Page</span>
          <small>진행 상태·셀렉</small>
        </Link>
        {/* 예전 메뉴 '로그인 · 예약 조회'(LOGIN_HREF): 자체 예약 중단으로 화면에서 뺌 */}
      </div>
    </header>
  );
}
