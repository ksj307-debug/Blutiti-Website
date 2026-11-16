"use client";

import { useCallback, useEffect, useState } from "react";
import { PROGRESS_STAGES } from "@/lib/mypage-schemas";

/**
 * 마이페이지 공통 (목록 /mypage · 상세 /mypage/[예약번호])
 * - 타입, 예약 불러오기, 날짜 표기, 제목, 로그인 화면
 */

/* ------------------------------------------------------------------
 * 타입 (GET /api/mypage/bookings 응답)
 * ------------------------------------------------------------------ */
export type Latest<T> = { content: T; created_at: string } | null;
export type SelectContent = { cuts: string };
export type OrderContent = { items: string[]; memo?: string };
export type InquiryContent = { message: string };
export type Booking = {
  booking_no: string;
  visit_at: string | null;
  product: string | null;
  options: string | null;
  progress: string | null;
  photo_url: string | null;
  responses: { select: Latest<SelectContent>; order: Latest<OrderContent>; inquiry: Latest<InquiryContent> };
};

export const FALLBACK_ERROR = "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요";

export async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    return typeof body.error === "string" && body.error ? body.error : FALLBACK_ERROR;
  } catch {
    return FALLBACK_ERROR;
  }
}

/* ------------------------------------------------------------------
 * 예약 불러오기: 쿠키 세션이 있으면 예약 목록, 없으면 'login'
 * ------------------------------------------------------------------ */
export type LoadState =
  | { kind: "checking" }
  | { kind: "login"; notice?: string }
  | { kind: "ready"; bookings: Booking[] }
  | { kind: "error"; message: string };

export function useMypageBookings() {
  const [state, setState] = useState<LoadState>({ kind: "checking" });

  const load = useCallback(async (notice?: string) => {
    try {
      const res = await fetch("/api/mypage/bookings", { cache: "no-store" });
      if (res.status === 401) return setState({ kind: "login", notice });
      if (!res.ok) return setState({ kind: "error", message: await readError(res) });
      const data = (await res.json()) as { bookings: Booking[] };
      setState({ kind: "ready", bookings: data.bookings });
    } catch {
      setState({ kind: "error", message: FALLBACK_ERROR });
    }
  }, []);

  useEffect(() => {
    // 처음 열 때 세션 확인 (외부 API 와 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return { state, setState, load };
}

/* ------------------------------------------------------------------
 * 날짜 표기 (항상 한국 시간)
 * ------------------------------------------------------------------ */
function kstParts(iso: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { y: get("year"), m: get("month"), d: get("day"), w: get("weekday"), hh: get("hour"), mm: get("minute") };
}
/** 2026년 11월 14일 (금) */
export const visitDate = (iso: string) => {
  const p = kstParts(iso);
  return `${p.y}년 ${p.m}월 ${p.d}일 (${p.w})`;
};
/** 2026.11.14 (금) */
export const visitDateShort = (iso: string) => {
  const p = kstParts(iso);
  return `${p.y}.${p.m.padStart(2, "0")}.${p.d.padStart(2, "0")} (${p.w})`;
};
/** 14:00 */
export const visitTime = (iso: string) => {
  const p = kstParts(iso);
  return `${p.hh}:${p.mm}`;
};
/** 11월 14일 21:30 */
export const submittedAt = (iso: string) => {
  const p = kstParts(iso);
  return `${p.m}월 ${p.d}일 ${p.hh}:${p.mm}`;
};

/** 진행 상태 7단계 중 몇 번째인지 (모르는 값이면 0 = 촬영 완료) */
export function stageIndex(progress: string | null): number {
  const i = PROGRESS_STAGES.indexOf((progress ?? "") as (typeof PROGRESS_STAGES)[number]);
  return i === -1 ? 0 : i;
}

/* ------------------------------------------------------------------
 * 제목
 * ------------------------------------------------------------------ */
export function Head({ title, desc, eyebrow = "MY PAGE" }: { title: string; desc?: string; eyebrow?: string }) {
  return (
    <div className="section-head mp-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="mp-h" className="h-kr">
        {title}
      </h1>
      {desc && <p className="muted">{desc}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------
 * 로그인
 * ------------------------------------------------------------------ */
export function LoginView({ notice, onSuccess }: { notice?: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone4, setPhone4] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(notice ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^\d{4}$/.test(phone4)) {
      setError("이름과 휴대폰 번호 뒷 4자리를 확인해 주세요");
      return;
    }
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/mypage/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone4 }),
      });
      if (!res.ok) {
        setError(await readError(res));
        setPending(false);
        return;
      }
      onSuccess();
    } catch {
      setError(FALLBACK_ERROR);
      setPending(false);
    }
  };

  return (
    <div className="mp-narrow">
      <Head title="My Page" desc="예약할 때 입력한 이름과 휴대폰 번호 뒷 4자리로 확인해요." />
      <form className="mp-login" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="mp-name">이름</label>
          <input
            id="mp-name"
            name="name"
            autoComplete="name"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="mp-phone4">휴대폰 번호 뒷 4자리</label>
          <input
            id="mp-phone4"
            name="phone4"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={4}
            value={phone4}
            onChange={(e) => setPhone4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
        </div>
        <p className="err" role="alert">
          {error}
        </p>
        <button className="btn btn-primary mp-wide" type="submit" disabled={pending}>
          {pending ? "확인하고 있어요" : "로그인"}
        </button>
      </form>
      <p className="cap muted mp-login-note">사진 보관 기간이 지난 예약과 취소한 예약은 보이지 않아요.</p>
    </div>
  );
}

/** 세션 확인 중 · 오류 화면 */
export function StatusView({ state, onRetry, title = "My Page" }: { state: LoadState; onRetry: () => void; title?: string }) {
  if (state.kind === "checking") {
    return (
      <div className="mp-narrow">
        <Head title={title} />
        <p className="muted" role="status">
          로그인 상태를 확인하고 있어요.
        </p>
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="mp-narrow">
        <Head title={title} />
        <p className="err" role="alert">
          {state.message}
        </p>
        <button className="btn" type="button" onClick={onRetry}>
          다시 시도하기
        </button>
      </div>
    );
  }
  return null;
}
