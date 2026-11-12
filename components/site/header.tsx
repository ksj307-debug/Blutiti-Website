"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Logo } from "@/components/site/logo";
import { KakaoChatButton } from "@/components/site/kakao";
import { BOOKING_HREF, LOGIN_HREF, MAIN_NAV } from "@/lib/nav";

/**
 * 상단 고정 헤더
 * - 메뉴 클릭: 메인에서는 해당 섹션으로 부드럽게 스크롤, 다른 페이지에서는 메인의 해당 섹션으로 이동
 * - 스크롤 위치에 따라 현재 섹션 메뉴 표시 (aria-current)
 * - 한 줄 배치, 로고는 화면 정중앙 (좌우 칸 1fr 로 폭을 맞춤)
 *   데스크톱: 왼쪽 메뉴 / 가운데 가로형 로고 / 오른쪽 로그인·예약하기
 *   모바일: 왼쪽 햄버거 / 가운데 세로형 로고 / 오른쪽 예약하기
 * - '예약하기'는 스크롤 위치와 상관없이 항상 코발트(.btn-primary)
 *   (예전: 히어로·[data-own-cta] 가 보이면 보조 버튼으로 바뀜 → 사용자 지시로 제거)
 * - 모바일 메뉴: 섹션 메뉴 → 구분선 → 카카오톡 문의 → 로그인
 */
/** 메뉴에 없는 섹션: 여기에 닿으면 현재 메뉴 표시 해제 */
const SPY_STOPS = ["booking"];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
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
        <Link className="brand" href="/" aria-label="블루티티 셀프스튜디오 홈 (맨 위로)" onClick={scrollTo("top")}>
          <Logo shape="horizontal" className="logo-h" decorative />
          <Logo shape="stacked" className="logo-s" decorative />
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
          <Link className="btn-secondary top-login" href={LOGIN_HREF}>
            로그인
          </Link>
          <Link className="btn-primary" href={BOOKING_HREF} onClick={scrollTo("booking")}>
            예약하기
          </Link>
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
        <Link href={LOGIN_HREF} onClick={() => setOpen(false)}>
          <span className="kr">로그인</span>
          <small>예약 조회</small>
        </Link>
      </div>
    </header>
  );
}
