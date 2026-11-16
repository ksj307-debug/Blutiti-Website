"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROGRESS_STAGES, RESPONSE_MAX_CHARS, type ResponseType } from "@/lib/mypage-schemas";
import { MYPAGE_ORDER_ITEMS } from "@/lib/mypage-config";

/* ------------------------------------------------------------------
 * 타입 (GET /api/mypage/bookings 응답)
 * ------------------------------------------------------------------ */
type Latest<T> = { content: T; created_at: string } | null;
type SelectContent = { cuts: string };
type OrderContent = { items: string[]; memo?: string };
type InquiryContent = { message: string };
type Booking = {
  booking_no: string;
  visit_at: string | null;
  product: string | null;
  options: string | null;
  progress: string | null;
  photo_url: string | null;
  responses: { select: Latest<SelectContent>; order: Latest<OrderContent>; inquiry: Latest<InquiryContent> };
};
/** 페이지 전체에서 열려 있는 탭은 한 곳 (코발트 제출 버튼이 화면에 하나만 보이게) */
type OpenTab = { bookingNo: string; tab: ResponseType } | null;

const FALLBACK_ERROR = "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요";
const TABS: { id: ResponseType; label: string }[] = [
  { id: "select", label: "셀렉" },
  { id: "order", label: "추가 주문" },
  { id: "inquiry", label: "문의" },
];

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
/** 카드 제목: 2026년 11월 14일 (금) */
const visitDate = (iso: string) => {
  const p = kstParts(iso);
  return `${p.y}년 ${p.m}월 ${p.d}일 (${p.w})`;
};
/** 이용 시각: 14:00 */
const visitTime = (iso: string) => {
  const p = kstParts(iso);
  return `${p.hh}:${p.mm}`;
};
/** 제출 시각: 11월 14일 21:30 */
const submittedAt = (iso: string) => {
  const p = kstParts(iso);
  return `${p.m}월 ${p.d}일 ${p.hh}:${p.mm}`;
};

/** 시트에서 온 사진 링크는 http(s) 만 열기 (javascript: 같은 주소 차단) */
function safeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    return typeof body.error === "string" && body.error ? body.error : FALLBACK_ERROR;
  } catch {
    return FALLBACK_ERROR;
  }
}

/* ==================================================================
 * 화면 전체: 세션 확인 → 로그인 또는 예약 목록
 * ================================================================== */
type View =
  | { kind: "checking" }
  | { kind: "login"; notice?: string }
  | { kind: "list"; bookings: Booking[] }
  | { kind: "error"; message: string };

export function MypageApp() {
  const [view, setView] = useState<View>({ kind: "checking" });

  /** 새로고침해도 쿠키 세션이 살아 있으면 바로 예약 목록 */
  const load = useCallback(async (notice?: string) => {
    try {
      const res = await fetch("/api/mypage/bookings", { cache: "no-store" });
      if (res.status === 401) return setView({ kind: "login", notice });
      if (!res.ok) return setView({ kind: "error", message: await readError(res) });
      const data = (await res.json()) as { bookings: Booking[] };
      setView({ kind: "list", bookings: data.bookings });
    } catch {
      setView({ kind: "error", message: FALLBACK_ERROR });
    }
  }, []);

  useEffect(() => {
    // 처음 열 때 세션 확인 (외부 API 와 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const logout = async () => {
    try {
      await fetch("/api/mypage/logout", { method: "POST" });
    } finally {
      setView({ kind: "login" });
    }
  };
  /** 답변 저장 중 세션이 끝나면 로그인 화면으로 */
  const expired = () => setView({ kind: "login", notice: "로그인 시간이 지났어요. 다시 로그인해 주세요" });

  if (view.kind === "checking") {
    return (
      <div className="mp-narrow">
        <Head title="내 사진" />
        <p className="muted" role="status">
          로그인 상태를 확인하고 있어요.
        </p>
      </div>
    );
  }
  if (view.kind === "error") {
    return (
      <div className="mp-narrow">
        <Head title="내 사진" />
        <p className="err" role="alert">
          {view.message}
        </p>
        <button className="btn" type="button" onClick={() => load()}>
          다시 시도하기
        </button>
      </div>
    );
  }
  if (view.kind === "login") return <LoginView notice={view.notice} onSuccess={() => load()} />;
  return <ListView bookings={view.bookings} onLogout={logout} onExpired={expired} />;
}

function Head({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="section-head mp-head">
      <p className="eyebrow">MY PAGE</p>
      <h1 id="mp-h" className="h-kr">
        {title}
      </h1>
      {desc && <p className="muted">{desc}</p>}
    </div>
  );
}

/* ==================================================================
 * 로그인
 * ================================================================== */
function LoginView({ notice, onSuccess }: { notice?: string; onSuccess: () => void }) {
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
      <Head title="내 사진 보기" desc="예약할 때 입력한 이름과 휴대폰 번호 뒷 4자리로 확인해요." />
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
          {pending ? "확인하고 있어요" : "내 사진 보기"}
        </button>
      </form>
      <p className="cap muted mp-login-note">사진 보관 기간이 지난 예약과 취소한 예약은 보이지 않아요.</p>
    </div>
  );
}

/* ==================================================================
 * 로그인 후: 예약 카드 목록
 * ================================================================== */
function ListView({ bookings, onLogout, onExpired }: { bookings: Booking[]; onLogout: () => void; onExpired: () => void }) {
  const [open, setOpen] = useState<OpenTab>(bookings[0] ? { bookingNo: bookings[0].booking_no, tab: "select" } : null);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div className="mp-list">
      <div className="mp-top">
        <Head title="내 사진" desc={bookings.length > 1 ? `예약 ${bookings.length}건을 최근 이용일 순서로 보여드려요.` : undefined} />
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
        <div className="mp-cards">
          {bookings.map((b) => (
            <BookingCard
              key={b.booking_no}
              booking={b}
              openTab={open?.bookingNo === b.booking_no ? open.tab : null}
              onTab={(tab) => setOpen({ bookingNo: b.booking_no, tab })}
              onExpired={onExpired}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking: b,
  openTab,
  onTab,
  onExpired,
}: {
  booking: Booking;
  openTab: ResponseType | null;
  onTab: (tab: ResponseType) => void;
  onExpired: () => void;
}) {
  const [responses, setResponses] = useState(b.responses);
  const photo = safeUrl(b.photo_url);
  const headId = `mp-b-${b.booking_no}`;

  return (
    <article className="mp-card" aria-labelledby={headId}>
      <header className="mp-card-head">
        <h2 id={headId} className="t-kr num">
          {b.visit_at ? visitDate(b.visit_at) : "이용일 확인 중"}
          {b.visit_at && <span className="mp-time"> {visitTime(b.visit_at)}</span>}
        </h2>
        {b.product && <p className="mp-product">{b.product}</p>}
        {b.options && <p className="muted mp-options">{b.options}</p>}
        <p className="index">예약번호 {b.booking_no}</p>
      </header>

      <section className="mp-block" aria-label="진행 상태">
        <p className="sub-h">진행 상태</p>
        <Steps progress={b.progress} />
      </section>

      <section className="mp-block mp-photo" aria-label="사진">
        {photo ? (
          <a className="btn mp-wide" href={photo} target="_blank" rel="noopener noreferrer">
            사진 보기 (새 창)
          </a>
        ) : (
          <>
            <button className="btn mp-wide" type="button" disabled aria-describedby={`${headId}-photo`}>
              사진 보기
            </button>
            <p id={`${headId}-photo`} className="cap muted">
              사진을 준비 중이에요.
            </p>
          </>
        )}
      </section>

      <section className="mp-block" aria-label="셀렉·추가 주문·문의">
        <div className="mp-tabs" role="tablist" aria-label="보내실 내용">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`${headId}-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={openTab === t.id}
              aria-controls={`${headId}-panel`}
              className="mp-tab"
              onClick={() => onTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {openTab ? (
          <div id={`${headId}-panel`} role="tabpanel" aria-labelledby={`${headId}-tab-${openTab}`} className="mp-panel">
            {openTab === "select" && (
              <SelectForm
                key="select"
                bookingNo={b.booking_no}
                latest={responses.select}
                onSaved={(v) => setResponses((r) => ({ ...r, select: v }))}
                onExpired={onExpired}
              />
            )}
            {openTab === "order" && (
              <OrderForm
                key="order"
                bookingNo={b.booking_no}
                latest={responses.order}
                onSaved={(v) => setResponses((r) => ({ ...r, order: v }))}
                onExpired={onExpired}
              />
            )}
            {openTab === "inquiry" && (
              <InquiryForm
                key="inquiry"
                bookingNo={b.booking_no}
                latest={responses.inquiry}
                onSaved={(v) => setResponses((r) => ({ ...r, inquiry: v }))}
                onExpired={onExpired}
              />
            )}
          </div>
        ) : (
          <p className="cap muted mp-tab-hint">셀렉, 추가 주문, 문의 중 하나를 눌러 열어 주세요.</p>
        )}
      </section>
    </article>
  );
}

/* ------------------------------------------------------------------
 * 진행 상태 7단계 (가로 스텝, 모바일은 가로 스크롤)
 * ------------------------------------------------------------------ */
function Steps({ progress }: { progress: string | null }) {
  const found = PROGRESS_STAGES.indexOf((progress ?? "") as (typeof PROGRESS_STAGES)[number]);
  const current = found === -1 ? 0 : found;
  const listRef = useRef<HTMLOListElement>(null);

  // 모바일에서 현재 단계가 보이게 가로 스크롤 위치 맞춤 (페이지 세로 스크롤은 건드리지 않음)
  useEffect(() => {
    const list = listRef.current;
    const now = list?.querySelector<HTMLElement>("[aria-current]");
    if (!list || !now || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = now.offsetLeft - (list.clientWidth - now.offsetWidth) / 2;
  }, [current]);

  return (
    <ol ref={listRef} className="mp-steps" tabIndex={0} aria-label={`진행 상태: ${PROGRESS_STAGES[current]}`}>
      {PROGRESS_STAGES.map((s, i) => (
        <li
          key={s}
          className={i < current ? "is-done" : i === current ? "is-now" : undefined}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="mp-dot" aria-hidden="true">
            {i + 1}
          </span>
          <span className="mp-step-label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------
 * 답변 저장 (공통)
 * ------------------------------------------------------------------ */
type Status = { kind: "idle" } | { kind: "pending" } | { kind: "done" } | { kind: "error"; message: string };

function useSubmit<T>(
  bookingNo: string,
  type: ResponseType,
  onSaved: (v: Latest<T>) => void,
  onExpired: () => void,
) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const submit = async (content: T) => {
    setStatus({ kind: "pending" });
    try {
      const res = await fetch("/api/mypage/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_no: bookingNo, type, content }),
      });
      if (res.status === 401) return onExpired();
      if (!res.ok) return setStatus({ kind: "error", message: await readError(res) });
      const data = (await res.json()) as { created_at: string };
      onSaved({ content, created_at: data.created_at });
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: FALLBACK_ERROR });
    }
  };
  /** 입력을 고치면 '제출했어요' 문구를 지움 */
  const touch = () => setStatus((s) => (s.kind === "done" || s.kind === "error" ? { kind: "idle" } : s));
  return { status, submit, touch, setStatus };
}

/** 제출 버튼 + 상태 문구 (현재 열린 탭의 제출 버튼 = 화면의 유일한 코발트) */
function SubmitRow({ status, hasPrevious }: { status: Status; hasPrevious: boolean }) {
  const pending = status.kind === "pending";
  return (
    <div className="mp-submit">
      <button className="btn btn-primary mp-wide" type="submit" disabled={pending}>
        {pending ? "보내는 중이에요" : hasPrevious ? "수정해서 다시 제출하기" : "제출하기"}
      </button>
      <p className={status.kind === "error" ? "err" : "cap muted"} role={status.kind === "error" ? "alert" : "status"}>
        {status.kind === "error"
          ? status.message
          : status.kind === "done"
            ? "제출했어요."
            : ""}
      </p>
    </div>
  );
}

function PreviousNote({ latest }: { latest: Latest<unknown> }) {
  if (!latest) return null;
  return (
    <p className="mp-prev cap">
      {submittedAt(latest.created_at)}에 제출했어요. 아래 내용을 고쳐서 다시 제출할 수 있어요.
    </p>
  );
}

function CharCount({ used }: { used: number }) {
  return (
    <span className={`index mp-count${used > RESPONSE_MAX_CHARS ? " is-over" : ""}`}>
      {used.toLocaleString("ko-KR")} / {RESPONSE_MAX_CHARS.toLocaleString("ko-KR")}자
    </span>
  );
}

type FormProps<T> = { bookingNo: string; latest: Latest<T>; onSaved: (v: Latest<T>) => void; onExpired: () => void };

/* 셀렉: 컷 번호 */
function SelectForm({ bookingNo, latest, onSaved, onExpired }: FormProps<SelectContent>) {
  const [cuts, setCuts] = useState(latest?.content.cuts ?? "");
  const { status, submit, touch, setStatus } = useSubmit<SelectContent>(bookingNo, "select", onSaved, onExpired);
  const id = `mp-cuts-${bookingNo}`;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const v = cuts.trim();
        if (!v) return setStatus({ kind: "error", message: "컷 번호를 적어 주세요" });
        if (v.length > RESPONSE_MAX_CHARS) return setStatus({ kind: "error", message: "내용은 2,000자 이내로 적어 주세요" });
        void submit({ cuts: v });
      }}
    >
      <PreviousNote latest={latest} />
      <div className="field">
        <label htmlFor={id}>고르신 컷 번호</label>
        <input
          id={id}
          inputMode="text"
          autoComplete="off"
          placeholder="예: 12, 15, 23"
          maxLength={RESPONSE_MAX_CHARS}
          value={cuts}
          onChange={(e) => {
            setCuts(e.target.value);
            touch();
          }}
          aria-describedby={`${id}-help`}
        />
        <p id={`${id}-help`} className="cap muted mp-help">
          사진 파일 이름의 번호를 쉼표로 나눠 적어 주세요.
        </p>
      </div>
      <SubmitRow status={status} hasPrevious={!!latest} />
    </form>
  );
}

/* 추가 주문: 항목 체크 + 메모 (금액 표시 없음) */
function OrderForm({ bookingNo, latest, onSaved, onExpired }: FormProps<OrderContent>) {
  const [items, setItems] = useState<string[]>(latest?.content.items ?? []);
  const [memo, setMemo] = useState(latest?.content.memo ?? "");
  const { status, submit, touch, setStatus } = useSubmit<OrderContent>(bookingNo, "order", onSaved, onExpired);
  const id = `mp-order-${bookingNo}`;
  // 예전에 고른 항목이 설정에서 빠졌어도 체크 상태로 보여줌 (저장값 유지)
  const choices = [...MYPAGE_ORDER_ITEMS, ...items.filter((it) => !MYPAGE_ORDER_ITEMS.includes(it))];
  const used = items.join("").length + memo.length;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (items.length === 0) return setStatus({ kind: "error", message: "주문할 항목을 하나 이상 골라 주세요" });
        if (used > RESPONSE_MAX_CHARS) return setStatus({ kind: "error", message: "내용은 2,000자 이내로 적어 주세요" });
        const m = memo.trim();
        void submit(m ? { items, memo: m } : { items });
      }}
    >
      <PreviousNote latest={latest} />
      <fieldset className="mp-fieldset">
        <legend className="field-label">추가로 원하시는 항목</legend>
        {choices.map((it) => (
          <label key={it} className="agree mp-check">
            <input
              type="checkbox"
              checked={items.includes(it)}
              onChange={(e) => {
                setItems((prev) => (e.target.checked ? [...prev, it] : prev.filter((x) => x !== it)));
                touch();
              }}
            />
            <span>{it}</span>
          </label>
        ))}
      </fieldset>
      <div className="field">
        <div className="mp-label-row">
          <label htmlFor={id}>메모 (선택)</label>
          <CharCount used={used} />
        </div>
        <textarea
          id={id}
          className="mp-textarea"
          rows={4}
          placeholder="수량이나 원하시는 크기를 적어 주세요."
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            touch();
          }}
        />
      </div>
      <SubmitRow status={status} hasPrevious={!!latest} />
    </form>
  );
}

/* 문의: 메시지 */
function InquiryForm({ bookingNo, latest, onSaved, onExpired }: FormProps<InquiryContent>) {
  const [message, setMessage] = useState(latest?.content.message ?? "");
  const { status, submit, touch, setStatus } = useSubmit<InquiryContent>(bookingNo, "inquiry", onSaved, onExpired);
  const id = `mp-inq-${bookingNo}`;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const v = message.trim();
        if (!v) return setStatus({ kind: "error", message: "문의 내용을 적어 주세요" });
        if (v.length > RESPONSE_MAX_CHARS) return setStatus({ kind: "error", message: "내용은 2,000자 이내로 적어 주세요" });
        void submit({ message: v });
      }}
    >
      <PreviousNote latest={latest} />
      <div className="field">
        <div className="mp-label-row">
          <label htmlFor={id}>문의 내용</label>
          <CharCount used={message.length} />
        </div>
        <textarea
          id={id}
          className="mp-textarea"
          rows={5}
          placeholder="궁금한 점을 편하게 적어 주세요."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            touch();
          }}
        />
      </div>
      <SubmitRow status={status} hasPrevious={!!latest} />
    </form>
  );
}
