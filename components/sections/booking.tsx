"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { findConcept, formatKRW, priceLabel, type ConceptId } from "@/lib/concepts";
import { EXTRA_PERSON_PRICE, PRE_ADD_ONS, REVISIT_OPTION } from "@/lib/options";
import { PRODUCTS, PRODUCT_CONCEPTS } from "@/lib/products";

/**
 * BOOKING (레퍼런스 미리보기 예약 흐름을 그대로 옮김. 실제 결제 없음)
 * 7단계에서 STEP 1 '컨셉 선택 × 가성비/패키지' 구조로 개편
 */
const OPTIONS = [...PRE_ADD_ONS.filter((o) => o.id !== "person"), REVISIT_OPTION];
const SLOTS: [number, number][] = [[10, 0], [11, 30], [13, 0], [14, 30], [16, 0], [17, 30], [19, 0], [20, 30]];
const SESSION_MIN = 80;
const EXT_MIN = 30;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (n: number) => (n < 10 ? "0" : "") + n;
const fmt = (h: number, m: number) => `${pad(h)}:${pad(m)}`;
const addMin = (h: number, m: number, plus: number) => {
  const t = h * 60 + m + plus;
  return fmt(Math.floor(t / 60), t % 60);
};

type Day = { y: number; m: number; d: number; w: number; key: string };

function buildDays(now: number): Day[] {
  const k = new Date(now + 9 * 3600e3);
  return Array.from({ length: 21 }, (_, i) => {
    const dt = new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + i));
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate(), w: dt.getUTCDay(), key: dt.toISOString().slice(0, 10) };
  });
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
/** 미리보기용 가짜 예약 현황 */
const booked = (key: string, i: number) => hash(`${key}#${i}`) % 10 < 3;
type SlotState = "open" | "booked" | "closed";
function slotState(now: number, day: Day, i: number): SlotState {
  const start = Date.UTC(day.y, day.m, day.d, SLOTS[i][0] - 9, SLOTS[i][1]);
  if (start - now < 6 * 3600e3) return "closed";
  if (booked(day.key, i)) return "booked";
  return "open";
}
const firstOpenSlot = (now: number, day: Day) => {
  const i = SLOTS.findIndex((_, i) => slotState(now, day, i) === "open");
  return i < 0 ? null : i;
};

type Done = { no: string; name: string; product: string; when: string; total: number };

const noopSubscribe = () => () => {};

export function Booking() {
  // 예약 가능 시간은 현재 시각 기준이라 서버 렌더와 어긋나지 않게 브라우저에서만 그림
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <section id="booking" className="band wrap" aria-labelledby="book-h">
      <div className="section-head">
        <p className="eyebrow">BOOKING</p>
        <h2 id="book-h" className="h-kr">
          예약하기
        </h2>
        <p className="muted cap" style={{ margin: 0 }}>
          예약은 촬영 시작 6시간 전까지 가능하고, 결제를 마치면 바로 확정돼요.{" "}
          <span className="demo-note">미리보기 화면이라 실제 결제는 되지 않아요</span>
        </p>
      </div>
      {mounted ? <BookingForm /> : <div className="booking" style={{ minHeight: 600 }} />}
    </section>
  );
}

function BookingForm() {
  const [now] = useState(() => Date.now());
  const days = useMemo(() => buildDays(now), [now]);
  const [initDate, initSlot] = useMemo(() => {
    for (let a = 0; a < days.length; a++) {
      const s = firstOpenSlot(now, days[a]);
      if (s !== null) return [a, s] as const;
    }
    return [0, null] as const;
  }, [days, now]);

  const [prod, setProd] = useState("pkg");
  const [concept, setConcept] = useState<ConceptId>("basic-color");
  const [date, setDate] = useState(initDate);
  const [slot, setSlot] = useState<number | null>(initSlot);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(1);
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("김블루");
  const [phone, setPhone] = useState("010-1234-5678");
  const [email, setEmail] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeSns, setAgreeSns] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const product = PRODUCTS.find((p) => p.id === prod)!;
  const day = days[date];
  const conceptName = findConcept(concept)?.name ?? "";
  const productLabel = (product.shortName ?? product.name) + (product.withConcept ? ` · ${conceptName}` : "");

  const ext = (() => {
    if (slot === null) return { ok: false, why: "먼저 시간을 선택해 주세요." };
    if (slot === SLOTS.length - 1) return { ok: false, why: "마지막 시간대라 연장할 수 없어요." };
    if (slotState(now, day, slot + 1) !== "open") return { ok: false, why: "다음 시간에 예약이 있어 연장할 수 없어요." };
    return { ok: true, why: "" };
  })();
  const selected = (id: string) => !!opts[id] && (id !== "ext" || ext.ok);
  const extra = Math.max(0, adults + Math.max(0, kids - 1) - 2);
  const total =
    (product.price.amount ?? 0) +
    extra * EXTRA_PERSON_PRICE +
    OPTIONS.reduce((sum, o) => sum + (selected(o.id) ? o.price : 0), 0);

  const whenLabel = (withEnd: boolean) => {
    if (slot === null) return "시간을 선택해 주세요";
    const [h, m] = SLOTS[slot];
    const end = addMin(h, m, SESSION_MIN + (selected("ext") ? EXT_MIN : 0));
    return `${day.m + 1}월 ${day.d}일(${DOW[day.w]}) ${fmt(h, m)}${withEnd ? `~${end}` : ""}`;
  };

  const pickDate = (a: number) => {
    setDate(a);
    setSlot(firstOpenSlot(now, days[a]));
  };

  const pay = () => {
    let e = "";
    const digits = phone.replace(/[^0-9]/g, "");
    if (slot === null) e = "예약할 시간을 선택해 주세요.";
    else if (!name.trim()) e = "예약자 이름을 입력해 주세요.";
    else if (digits.length < 10) e = "휴대폰 번호를 확인해 주세요. 예약 안내를 카카오톡으로 보내드려요.";
    else if (!agreePolicy || !agreePrivacy) e = "필수 동의 항목에 체크해 주세요.";
    setErr(e);
    if (e || slot === null) return;
    setDone({
      no: `BT-${pad(day.m + 1)}${pad(day.d)}-${pad(((slot * 7) % 60) + 3)}`,
      name: name.trim(),
      product: productLabel,
      when: whenLabel(false),
      total,
    });
    document.getElementById("booking")?.scrollIntoView({ block: "start" });
  };

  if (done) {
    return (
      <div className="booking">
        <div className="done" style={{ gridColumn: "1/-1" }}>
          <span className="demo-note" style={{ justifySelf: "start" }}>
            미리보기 · 실제 결제는 진행되지 않았어요
          </span>
          <h3 className="display">
            See you <em>soon</em>
          </h3>
          <p className="h-kr" style={{ fontSize: 24, lineHeight: "36px" }}>
            {done.name}님, 예약이 확정되면 이렇게 안내돼요
          </p>
          <dl className="kv">
            <dt>예약번호</dt>
            <dd className="num">{done.no}</dd>
            <dt>상품</dt>
            <dd>{done.product}</dd>
            <dt>일시</dt>
            <dd className="num">{done.when}</dd>
            <dt>결제 금액</dt>
            <dd className="num">{formatKRW(done.total)}</dd>
          </dl>
          <p className="muted">
            예약 확정 안내와 촬영 전날 리마인드를 카카오톡으로 보내드려요. 진행 상황은 예약 조회에서 확인하세요.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/login">
              예약 조회로 가기
            </Link>
            <button className="btn" type="button" onClick={() => window.location.reload()}>
              처음부터 다시 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking">
      <div>
        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 1</span>
            <h3 className="t-kr">상품 선택</h3>
          </div>
          <div className="choices" role="group" aria-label="촬영 상품">
            {PRODUCTS.map((p) => (
              <button key={p.id} type="button" className="choice" aria-pressed={prod === p.id} onClick={() => setProd(p.id)}>
                <b>{p.shortName ?? p.name}</b>
                <span className="p">{priceLabel(p.price)}</span>
                <small>{p.note}</small>
              </button>
            ))}
          </div>
          {product.withConcept && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <p className="cap muted" style={{ margin: "0 0 8px" }}>
                컨셉
              </p>
              <div className="choices" role="group" aria-label="컨셉">
                {PRODUCT_CONCEPTS.map((id) => (
                  <button key={id} type="button" className="choice" aria-pressed={concept === id} onClick={() => setConcept(id)}>
                    <b>{findConcept(id)?.name}</b>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 2</span>
            <h3 className="t-kr">날짜와 시간</h3>
          </div>
          <div className="dates" role="group" aria-label="날짜">
            {days.map((d, a) => (
              <button
                key={d.key}
                type="button"
                className={`date${d.w === 0 ? " sun" : ""}`}
                aria-pressed={date === a}
                aria-label={`${d.m + 1}월 ${d.d}일 ${DOW[d.w]}요일`}
                onClick={() => pickDate(a)}
              >
                <span className="dow">{DOW[d.w]}</span>
                <span className="d">{d.d}</span>
                <span className="m">{d.m + 1}월</span>
              </button>
            ))}
          </div>
          <div className="slots" role="group" aria-label="시간">
            {SLOTS.map(([h, m], i) => {
              const ss = slotState(now, day, i);
              const label = ss === "open" ? "예약 가능" : ss === "booked" ? "마감" : "예약 시간 지남";
              return (
                <button key={i} type="button" className="slot" aria-pressed={slot === i} disabled={ss !== "open"} onClick={() => setSlot(i)}>
                  <b>{fmt(h, m)}</b>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div className="legend cap muted">
            <span>매일 10:00~21:50 · 1회 이용 1시간 20분</span>
            <span>선이 그어진 시간은 마감이에요</span>
          </div>
        </div>

        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 3</span>
            <h3 className="t-kr">인원과 추가 옵션</h3>
          </div>
          <Counter label="어른·만 8세 이상" help="기준 인원 1~2명" value={adults} min={1} onChange={setAdults} noun="어른" />
          <Counter label="만 7세 이하" help="1명 무료, 2명부터 인원 추가" value={kids} min={0} onChange={setKids} noun="아이" />
          <p className="cap muted" style={{ margin: "10px 0 var(--space-6)" }}>
            {extra
              ? `인원 추가 ${extra}명이 함께 결제돼요 (+${formatKRW(extra * EXTRA_PERSON_PRICE)}).`
              : "추가 요금 없이 촬영할 수 있는 인원이에요."}
          </p>
          <div>
            {OPTIONS.map((o) => {
              const off = o.id === "ext" && !ext.ok;
              return (
                <label key={o.id} className={`opt-row${off ? " off" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selected(o.id)}
                    disabled={off}
                    onChange={(e) => setOpts((s) => ({ ...s, [o.id]: e.target.checked }))}
                  />
                  <span>
                    <b>{o.name}</b>
                    <small>{off ? ext.why : (o.bookingDesc ?? o.desc)}</small>
                  </span>
                  <span className="p">{o.price ? `+${formatKRW(o.price)}` : "무료"}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 4</span>
            <h3 className="t-kr">예약자 정보</h3>
          </div>
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <div className="fields">
              <div className="field">
                <label htmlFor="b-name">이름</label>
                <input id="b-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="b-phone">휴대폰 번호</label>
                <input
                  id="b-phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="field" style={{ gridColumn: "1/-1" }}>
                <label htmlFor="b-email">
                  이메일{" "}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    (사진 링크 사본을 보내드려요)
                  </span>
                </label>
                <input
                  id="b-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="policy">
              <b>예약 변경·취소 안내</b>
              <ul>
                <li>변경·취소는 촬영일 3일 전까지 가능해요.</li>
                <li>2일 이내 예약은 변경·취소가 어려워요. 부득이한 경우 일정 변경만 1회 가능해요.</li>
                <li>늦게 도착하셔도 퇴실은 정시 기준이에요.</li>
              </ul>
            </div>
            <Agree checked={agreePolicy} onChange={setAgreePolicy} label="변경·취소 안내를 확인했어요 (필수)" />
            <Agree checked={agreePrivacy} onChange={setAgreePrivacy} label="예약 안내를 위한 개인정보 수집·이용에 동의해요 (필수)" />
            <Agree checked={agreeSns} onChange={setAgreeSns} label="SNS 활용에 동의해요 (선택) · 고화질 원본을 무료로 드려요" />
          </form>
        </div>
      </div>

      <aside className="summary" aria-label="예약 요약">
        <h3 className="t-kr">예약 내용</h3>
        <dl className="sum-rows">
          <SumRow k="상품" v={productLabel} />
          <SumRow k="일시" v={whenLabel(true)} />
          <SumRow k="인원" v={`어른 ${adults} · 아이 ${kids}`} />
          <SumRow k="기본" v={priceLabel(product.price)} />
          {extra > 0 && <SumRow k={`인원 추가 ${extra}명`} v={formatKRW(extra * EXTRA_PERSON_PRICE)} />}
          {OPTIONS.filter((o) => selected(o.id)).map((o) => (
            <SumRow key={o.id} k={o.shortName ?? o.name} v={o.price ? formatKRW(o.price) : "무료"} />
          ))}
        </dl>
        <div className="total">
          <span className="cap muted">결제 금액</span>
          <b className="num">{formatKRW(total)}</b>
        </div>
        <p className="err" role="alert">
          {err}
        </p>
        <button className="btn btn-primary" type="button" style={{ width: "100%" }} onClick={pay}>
          결제하고 예약 확정
        </button>
        <p className="cap muted" style={{ margin: "var(--space-4) 0 0" }}>
          카드·간편결제로 선결제해요. 현장 결제는 없어요.
        </p>
      </aside>
    </div>
  );
}

function SumRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Counter(props: { label: string; help: string; value: number; min: number; noun: string; onChange: (n: number) => void }) {
  const { label, help, value, min, noun, onChange } = props;
  return (
    <div className="counter-row">
      <div>
        <b>{label}</b>
        <div className="cap muted">{help}</div>
      </div>
      <div className="counter">
        <button type="button" aria-label={`${noun} 줄이기`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output>{value}</output>
        <button type="button" aria-label={`${noun} 늘리기`} disabled={value >= 8} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}

function Agree({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="agree">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
