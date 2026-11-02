"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { BOOKING_HREF, MAIN_NAV } from "@/lib/nav";

/** 상단 헤더 (레퍼런스 구조 유지. 2단계에서 2줄 구조·로그인 버튼으로 개편) */
export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="top">
      <div className="wrap">
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
        <nav className="nav" aria-label="주요 메뉴">
          {MAIN_NAV.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="brand" href="/#top" aria-label="블루티티 셀프스튜디오 홈">
          <Logo shape="horizontal" className="logo-h" decorative />
          <Logo shape="stacked" className="logo-s" decorative />
        </Link>
        <div className="top-right">
          <Link className="book" href={BOOKING_HREF}>
            BOOKING
          </Link>
        </div>
      </div>
      <div className="drawer" id="drawer" hidden={!open} onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
        {MAIN_NAV.map((item) => (
          <Link key={item.label} href={item.href}>
            <span>{item.label}</span>
            <small>{item.sub}</small>
          </Link>
        ))}
      </div>
    </header>
  );
}
