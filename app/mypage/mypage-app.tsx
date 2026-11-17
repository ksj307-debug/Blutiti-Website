"use client";

import Link from "next/link";
import { useState } from "react";
import { PROGRESS_STAGES } from "@/lib/mypage-schemas";
import { productLabel } from "@/lib/mypage-labels";
import { Head, LoginView, StatusView, stageIndex, useMypageBookings, visitDateShort, type Booking } from "./mypage-shared";

/**
 * /mypage: 로그인 → 예약 목록 (이용일 최신순, 1건이어도 목록부터)
 * - 한 행 = 날짜 · 상품 · 진행 상태. 누르면 상세 /mypage/[예약번호]
 * - 상세 화면(진행 상태·사진 다운로드·셀렉·촬영 후 추가 구매)은 ./[bookingNo]/booking-detail.tsx
 * 예전(2026-11 첫 버전): 로그인 후 바로 예약 카드를 모두 펼쳐 보여줌 → 목록 + 상세로 나눔
 */
export function MypageApp() {
  const { state, setState, load } = useMypageBookings();

  if (state.kind === "checking" || state.kind === "error") return <StatusView state={state} onRetry={() => load()} />;
  if (state.kind === "login") return <LoginView notice={state.notice} onSuccess={() => load()} />;

  const logout = async () => {
    try {
      await fetch("/api/mypage/logout", { method: "POST" });
    } finally {
      setState({ kind: "login" });
    }
  };
  return <ListView bookings={state.bookings} onLogout={logout} />;
}

function ListView({ bookings, onLogout }: { bookings: Booking[]; onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <div className="mp-list">
      <div className="mp-top">
        <Head title="My Page" desc="예약을 누르면 진행 상태와 사진을 볼 수 있어요." />
        <button
          className="btn"
          type="button"
          disabled={loggingOut}
          onClick={() => {
            setLoggingOut(true);
            onLogout();
          }}
        >
          {loggingOut ? "로그아웃하는 중" : "로그아웃"}
        </button>
      </div>
      {bookings.length === 0 ? (
        <p className="muted">보여드릴 예약이 없어요.</p>
      ) : (
        <>
          <p className="sub-h">예약 {bookings.length}건 · 이용일 최신순</p>
          <ul className="mp-rows">
            {/* 표 머리행: 날짜 / 구매상품 / 상태 (모바일·PC 공통, 아래 행과 같은 칸 배치) */}
            <li className="mp-rows-head" aria-hidden="true">
              <span className="mp-row-date">날짜</span>
              <span className="mp-row-product">구매상품</span>
              <span className="mp-row-stage">상태</span>
            </li>
            {bookings.map((b) => {
              const stage = stageIndex(b.progress);
              return (
                <li key={b.booking_no}>
                  <Link href={`/mypage/${encodeURIComponent(b.booking_no)}`} className="mp-row">
                    <span className="mp-row-date num">{b.visit_at ? visitDateShort(b.visit_at) : "이용일 확인 중"}</span>
                    {/* '베이직 컬러 · 패키지' (lib/mypage-labels.ts, 상세와 같은 함수). 예전: product 원문 */}
                    <span className="mp-row-product">{productLabel(b.product, b.options) || "상품 확인 중"}</span>
                    <span className={`mp-row-stage${stage === PROGRESS_STAGES.length - 1 ? " is-end" : ""}`}>
                      {stage + 1} {PROGRESS_STAGES[stage]}
                    </span>
                    <span className="mp-row-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
