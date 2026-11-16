"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PROGRESS_STAGES, RESPONSE_MAX_CHARS, type ResponseType } from "@/lib/mypage-schemas";
import { ORDER_ITEMS, ORDER_NOTICE, won } from "@/lib/mypage-config";
import {
  FALLBACK_ERROR,
  Head,
  StatusView,
  readError,
  stageIndex,
  submittedAt,
  useMypageBookings,
  visitDate,
  visitTime,
  type Booking,
  type InquiryContent,
  type Latest,
  type OrderContent,
  type SelectContent,
} from "../mypage-shared";

/**
 * 예약 상세 (/mypage/[예약번호])
 * - 위: '← 목록으로' / 날짜·상품·옵션
 * - 진행 상태 7단계 (번호 + 이름) + 주석 '가성비 고객은 1, 2, 7만 제공'
 * - 사진 다운로드 (구글 드라이브 로고). 없으면 비활성 + 준비 중 안내 + 보관 기간
 * - 탭: 셀렉 / 추가 주문 (코발트 = 열린 탭의 제출 버튼 한 곳)
 *   문의 탭은 화면에서 뺌 (API·DB 의 inquiry 타입과 기존 문의 데이터는 그대로, InquiryForm 코드 보관)
 */
type TabId = Exclude<ResponseType, "inquiry">;
const TABS: { id: TabId; label: string }[] = [
  { id: "select", label: "셀렉" },
  { id: "order", label: "추가 주문" },
  // 예전: { id: "inquiry", label: "문의" } → 2026-11 화면에서 뺌
];

export function BookingDetail() {
  const params = useParams<{ bookingNo: string }>();
  const bookingNo = decodeURIComponent(params.bookingNo ?? "");
  const router = useRouter();
  const { state, load } = useMypageBookings();
  const booking = state.kind === "ready" ? state.bookings.find((b) => b.booking_no === bookingNo) : undefined;

  // 로그인 전이거나, 세션에 없는 예약번호면 목록(/mypage)으로
  const leave = state.kind === "login" || (state.kind === "ready" && !booking);
  useEffect(() => {
    if (leave) router.replace("/mypage");
  }, [leave, router]);

  if (state.kind === "checking" || state.kind === "error") return <StatusView state={state} onRetry={() => load()} />;
  if (!booking) {
    return (
      <div className="mp-narrow">
        <Head title="My Page" />
        <p className="muted" role="status">
          예약 목록으로 이동하고 있어요.
        </p>
      </div>
    );
  }
  return <Detail booking={booking} onExpired={() => router.replace("/mypage")} />;
}

function Detail({ booking: b, onExpired }: { booking: Booking; onExpired: () => void }) {
  const [tab, setTab] = useState<TabId>("select");
  const [responses, setResponses] = useState(b.responses);
  const photo = safeUrl(b.photo_url);
  const id = `mp-b-${b.booking_no}`;

  return (
    <div className="mp-list">
      <Link className="btn mp-back" href="/mypage">
        <span aria-hidden="true">←</span> 목록으로
      </Link>

      <article className="mp-card" aria-labelledby="mp-h">
        <header className="mp-card-head">
          <p className="eyebrow">MY PAGE</p>
          <h1 id="mp-h" className="t-kr num">
            {b.visit_at ? visitDate(b.visit_at) : "이용일 확인 중"}
            {b.visit_at && <span className="mp-time"> {visitTime(b.visit_at)}</span>}
          </h1>
          {b.product && <p className="mp-product">{b.product}</p>}
          {b.options && <p className="muted mp-options">{b.options}</p>}
          <p className="index">예약번호 {b.booking_no}</p>
        </header>

        <section className="mp-block" aria-label="진행 상태">
          <p className="sub-h">진행 상태</p>
          <Steps progress={b.progress} />
          <p className="cap muted mp-steps-note">가성비 고객은 1, 2, 7만 제공</p>
        </section>

        <section className="mp-block mp-photo" aria-label="사진">
          {photo ? (
            <a className="btn mp-wide mp-drive" href={photo} target="_blank" rel="noopener noreferrer">
              <DriveLogo />
              사진 다운로드
            </a>
          ) : (
            <>
              <button className="btn mp-wide mp-drive" type="button" disabled aria-describedby={`${id}-photo`}>
                <DriveLogo />
                사진 다운로드
              </button>
              <div id={`${id}-photo`} className="mp-photo-notes">
                <p className="cap muted">사진을 준비 중이에요.</p>
                <p className="cap muted mp-small">사진 파일은 최대 3개월 간 보관합니다.</p>
              </div>
            </>
          )}
        </section>

        <section className="mp-block" aria-label="셀렉·추가 주문">
          <div className="mp-tabs" role="tablist" aria-label="보내실 내용">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`${id}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`${id}-panel`}
                className="mp-tab"
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} className="mp-panel">
            {tab === "select" ? (
              <SelectForm
                key="select"
                bookingNo={b.booking_no}
                latest={responses.select}
                onSaved={(v) => setResponses((r) => ({ ...r, select: v }))}
                onExpired={onExpired}
              />
            ) : (
              <OrderForm
                key="order"
                bookingNo={b.booking_no}
                latest={responses.order}
                onSaved={(v) => setResponses((r) => ({ ...r, order: v }))}
                onExpired={onExpired}
              />
            )}
          </div>
        </section>
      </article>
    </div>
  );
}

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

/** 구글 드라이브 로고 (공식 6색 삼각형 모양 그대로, 18px) */
function DriveLogo() {
  return (
    <svg className="mp-drive-logo" width="18" height="16" viewBox="0 0 87.3 78" aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

/* ------------------------------------------------------------------
 * 진행 상태 7단계 (가로 스텝, 모바일은 가로 스크롤). 이름 앞에 번호 (1 촬영 완료 ~ 7 완료)
 * ------------------------------------------------------------------ */
function Steps({ progress }: { progress: string | null }) {
  const current = stageIndex(progress);
  const listRef = useRef<HTMLOListElement>(null);

  // 모바일에서 현재 단계가 보이게 가로 스크롤 위치 맞춤 (페이지 세로 스크롤은 건드리지 않음)
  useEffect(() => {
    const list = listRef.current;
    const now = list?.querySelector<HTMLElement>("[aria-current]");
    if (!list || !now || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = now.offsetLeft - (list.clientWidth - now.offsetWidth) / 2;
  }, [current]);

  return (
    <ol ref={listRef} className="mp-steps" tabIndex={0} aria-label={`진행 상태: ${current + 1} ${PROGRESS_STAGES[current]}`}>
      {PROGRESS_STAGES.map((s, i) => (
        <li
          key={s}
          className={i < current ? "is-done" : i === current ? "is-now" : undefined}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="mp-dot" aria-hidden="true" />
          <span className="mp-step-label">
            <span className="mp-step-no num">{i + 1}</span> {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------
 * 답변 저장 (공통)
 * ------------------------------------------------------------------ */
type Status = { kind: "idle" } | { kind: "pending" } | { kind: "done" } | { kind: "error"; message: string };

function useSubmit<T>(bookingNo: string, type: ResponseType, onSaved: (v: Latest<T>) => void, onExpired: () => void) {
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

/** 제출 버튼 + 상태 문구 (열린 탭의 제출 버튼 = 화면의 유일한 코발트) */
function SubmitRow({ status, hasPrevious }: { status: Status; hasPrevious: boolean }) {
  const pending = status.kind === "pending";
  return (
    <div className="mp-submit">
      <button className="btn btn-primary mp-wide" type="submit" disabled={pending}>
        {pending ? "보내는 중이에요" : hasPrevious ? "수정해서 다시 제출하기" : "제출하기"}
      </button>
      <p className={status.kind === "error" ? "err" : "cap muted"} role={status.kind === "error" ? "alert" : "status"}>
        {status.kind === "error" ? status.message : status.kind === "done" ? "제출했어요." : ""}
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

/* 셀렉: 컷 파일명 (저장 구조는 그대로 content.cuts 문자열) */
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
        if (!v) return setStatus({ kind: "error", message: "셀렉한 컷 파일명을 적어 주세요" });
        if (v.length > RESPONSE_MAX_CHARS) return setStatus({ kind: "error", message: "내용은 2,000자 이내로 적어 주세요" });
        void submit({ cuts: v });
      }}
    >
      <PreviousNote latest={latest} />
      <div className="field">
        <label htmlFor={id}>셀렉한 컷 파일명</label>
        <input
          id={id}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="예: IMG_0012, IMG_0035"
          maxLength={RESPONSE_MAX_CHARS}
          value={cuts}
          onChange={(e) => {
            setCuts(e.target.value);
            touch();
          }}
          aria-describedby={`${id}-help`}
        />
        <p id={`${id}-help`} className="cap muted mp-help">
          파일 이름을 쉼표로 나눠 적어 주세요.
        </p>
      </div>
      <SubmitRow status={status} hasPrevious={!!latest} />
    </form>
  );
}

/* 추가 주문: 항목(이름·가격 lib/mypage-config.ts) 체크 + 파일명·요청 사항 + 합계 */
function OrderForm({ bookingNo, latest, onSaved, onExpired }: FormProps<OrderContent>) {
  const [items, setItems] = useState<string[]>(latest?.content.items ?? []);
  const [memo, setMemo] = useState(latest?.content.memo ?? "");
  const { status, submit, touch, setStatus } = useSubmit<OrderContent>(bookingNo, "order", onSaved, onExpired);
  const id = `mp-order-${bookingNo}`;
  // 예전 항목명(보정 추가·인화·액자 등)으로 저장된 답변은 원문 그대로 체크해 보여줌 (가격 없음)
  const legacy = items.filter((it) => !ORDER_ITEMS.some((o) => o.name === it));
  const total = ORDER_ITEMS.filter((o) => items.includes(o.name)).reduce((sum, o) => sum + o.price, 0);
  const used = items.join("").length + memo.length;
  const toggle = (name: string, on: boolean) => {
    setItems((prev) => (on ? [...prev, name] : prev.filter((x) => x !== name)));
    touch();
  };

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
      <div className="mp-notice">
        <p>{ORDER_NOTICE.lead}</p>
        <p>
          (입금 계좌: {ORDER_NOTICE.account.bank} <span className="num mp-nowrap">{ORDER_NOTICE.account.number}</span>{" "}
          {ORDER_NOTICE.account.holder})
        </p>
        <p className="muted">{ORDER_NOTICE.depositor}</p>
      </div>
      <fieldset className="mp-fieldset">
        <legend className="field-label">추가 옵션</legend>
        {ORDER_ITEMS.map((o) => (
          <label key={o.name} className="agree mp-check">
            <input type="checkbox" checked={items.includes(o.name)} onChange={(e) => toggle(o.name, e.target.checked)} />
            <span className="mp-check-text">
              <span>{o.name}</span>
              {o.note && <small className="mp-check-note">{o.note}</small>}
            </span>
            <span className="mp-price num">{won(o.price)}</span>
          </label>
        ))}
        {legacy.map((it) => (
          <label key={it} className="agree mp-check">
            <input type="checkbox" checked onChange={(e) => toggle(it, e.target.checked)} />
            <span className="mp-check-text">
              <span>{it}</span>
              <small className="mp-check-note">예전에 고르신 항목</small>
            </span>
            <span className="mp-price" />
          </label>
        ))}
      </fieldset>
      <div className="field">
        <div className="mp-label-row">
          <label htmlFor={id}>파일명·요청 사항</label>
          <CharCount used={used} />
        </div>
        <textarea
          id={id}
          className="mp-textarea"
          rows={4}
          placeholder="예: 증명사진 IMG_0012 / 4컷 프레임 IMG_0035, IMG_0041"
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            touch();
          }}
        />
      </div>
      <p className="mp-total" aria-live="polite">
        <span>합계</span>
        <span className="num">{won(total)}</span>
      </p>
      <SubmitRow status={status} hasPrevious={!!latest} />
    </form>
  );
}

/**
 * 미사용(2026-11 화면에서 뺌): 문의 탭. API·DB 의 inquiry 타입과 저장된 문의는 그대로
 * 다시 쓰려면 TABS 에 { id: "inquiry", label: "문의" } 를 넣고 TabId 에서 inquiry 를 빼면 돼요
 */
export function InquiryForm({ bookingNo, latest, onSaved, onExpired }: FormProps<InquiryContent>) {
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
