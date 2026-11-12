"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  CONCEPTS,
  PLANS,
  findConcept,
  formatKRW,
  isPayable,
  priceLabel,
  type Concept,
  type ConceptId,
  type PlanId,
} from "@/lib/concepts";
import { KakaoChatButton } from "@/components/site/kakao";
import { Sentences } from "@/components/site/sentences";
import { Calendar } from "@/components/ui/calendar";
import { EXTRA_PERSON_PRICE, PRE_ADD_ONS, REVISIT_OPTION } from "@/lib/options";

/**
 * BOOKING (미리보기 예약 흐름. 실제 결제 없음)
 * STEP 1 컨셉 선택(lib/concepts.ts, 시즌은 크리스마스·졸업 따로) → 세부 상품 → 필수 선택(가성비/패키지)
 * 금액이 '문의'인 조합은 결제 대신 카카오톡 문의
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * URL ?concept={id} 로 들어오면 해당 컨셉을 미리 선택 (CONCEPTS '이걸로 예약하기')
 * - 파라미터 없음: 베이직 컬러 / 모르는 id: 선택 없음 / 예전 세이지 포레스트: 베이직 컬러(통합)
 * - 예전 ?concept=season: 크리스마스·졸업 중 하나로 정할 수 없어 선택 없음
 */
function initialConcept(): ConceptId | null {
  const param = new URLSearchParams(window.location.search).get("concept");
  if (param === null) return "basic-color";
  return findConcept(param)?.id ?? null;
}
const firstVariant = (id: ConceptId | null) => (id ? (findConcept(id)?.variants[0].id ?? null) : null);
/** 컨셉 선택지 보조 문구 */
const conceptNote = (c: Concept) =>
  c.variants.length > 1 ? c.variants.map((v) => v.name).join(" / ") : c.variants[0].note;
const OPTIONS = [...PRE_ADD_ONS.filter((o) => o.id !== "person"), REVISIT_OPTION];
/** 예약 변경·취소 안내 */
const POLICY = [
  "변경·취소는 촬영일 3일 전까지 가능해요.",
  "2일 이내 예약은 변경·취소가 어려워요. 부득이한 경우 일정 변경만 1회 가능해요.",
  "늦게 도착하셔도 퇴실은 정시 기준이에요.",
];
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
/** 달력(브라우저 현지 날짜) ↔ 예약일(KST) 연결: 같은 연·월·일로 맞춤 */
const toDate = (d: Day) => new Date(d.y, d.m, d.d);
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const firstOpenSlot = (now: number, day: Day) => {
  const i = SLOTS.findIndex((_, i) => slotState(now, day, i) === "open");
  return i < 0 ? null : i;
};

/** 예약 완료 기록. phone 은 숫자만, carNo 는 선택 (비면 없음) */
type Done = { no: string; name: string; phone: string; email: string; carNo?: string; product: string; when: string; total: number };

const noopSubscribe = () => () => {};

export function Booking() {
  // 예약 가능 시간은 현재 시각 기준이라 서버 렌더와 어긋나지 않게 브라우저에서만 그림
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    // data-own-cta: 예약 섹션 안의 결제 버튼(코발트)이 보이는 동안 헤더·하단 바 예약하기는 보조 버튼
    <section id="booking" data-own-cta className="band wrap" aria-labelledby="book-h">
      <div className="section-head">
        <p className="eyebrow">BOOKING</p>
        <h2 id="book-h" className="h-kr">
          예약하기
        </h2>
        <p className="muted cap" style={{ margin: 0 }}>
          <Sentences text="예약은 촬영 시작 6시간 전까지 가능하고, 결제를 마치면 바로 확정돼요." />{" "}
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

  // STEP 1: 컨셉 → (증명·프로필 세부 상품 / 시즌 테마) → 필수 선택(가성비/패키지)
  const [conceptId, setConceptId] = useState<ConceptId | null>(initialConcept);
  const [variantId, setVariantId] = useState<string | null>(() => firstVariant(initialConcept()));
  const [plan, setPlan] = useState<PlanId>("package");
  const [date, setDate] = useState(initDate);
  const [slot, setSlot] = useState<number | null>(initSlot);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(1);
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("김블루");
  const [phone, setPhone] = useState("010-1234-5678");
  const [email, setEmail] = useState("");
  const [carNo, setCarNo] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeSns, setAgreeSns] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const day = days[date];
  const concept = conceptId ? CONCEPTS.find((c) => c.id === conceptId) : undefined;
  const variant = concept?.variants.find((v) => v.id === variantId);
  const price = variant?.plans[plan];
  const payable = !!price && isPayable(price);
  const planName = PLANS.find((p) => p.id === plan)!.name;
  const productLabel = !concept
    ? "컨셉을 선택해 주세요"
    : [concept.variants.length > 1 ? (variant?.name ?? concept.bookingName) : concept.bookingName, planName].join(" · ");

  const pickConcept = (id: ConceptId) => {
    setConceptId(id);
    setVariantId(firstVariant(id));
  };

  const ext = (() => {
    if (slot === null) return { ok: false, why: "먼저 시간을 선택해 주세요." };
    if (slot === SLOTS.length - 1) return { ok: false, why: "마지막 시간대라 연장할 수 없어요." };
    if (slotState(now, day, slot + 1) !== "open") return { ok: false, why: "다음 시간에 예약이 있어 연장할 수 없어요." };
    return { ok: true, why: "" };
  })();
  const selected = (id: string) => !!opts[id] && (id !== "ext" || ext.ok);
  const extra = Math.max(0, adults + Math.max(0, kids - 1) - 2);
  const total =
    (price?.amount ?? 0) +
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
    // 휴대폰 번호는 숫자만 저장 (예약 조회 로그인 시 뒷 4자리 비교)
    const digits = phone.replace(/[^0-9]/g, "");
    if (!concept || !variant) e = "촬영할 컨셉을 선택해 주세요.";
    else if (slot === null) e = "예약할 시간을 선택해 주세요.";
    else if (!name.trim()) e = "예약자 이름을 입력해 주세요.";
    else if (digits.length < 10) e = "휴대폰 번호를 확인해 주세요. 예약 안내를 카카오톡으로 보내드려요.";
    else if (!EMAIL_RE.test(email.trim())) e = "이메일 주소를 확인해 주세요. 예약 조회 로그인에 쓰여요.";
    else if (!agreePolicy || !agreePrivacy) e = "필수 동의 항목에 체크해 주세요.";
    setErr(e);
    if (e || slot === null) return;
    setDone({
      no: `BT-${pad(day.m + 1)}${pad(day.d)}-${pad(((slot * 7) % 60) + 3)}`,
      name: name.trim(),
      phone: digits,
      email: email.trim(),
      carNo: carNo.trim() || undefined,
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
            {done.carNo && (
              <>
                <dt>차량번호</dt>
                <dd>{done.carNo}</dd>
              </>
            )}
            <dt>결제 금액</dt>
            <dd className="num">{formatKRW(done.total)}</dd>
          </dl>
          <p className="muted">
            <Sentences text="예약 확정 안내와 촬영 전날 리마인드를 카카오톡으로 보내드려요. 진행 상황은 예약 조회에서 확인하세요." />
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
            <h3 className="t-kr">컨셉 선택</h3>
          </div>
          <div className="choices" role="group" aria-label="컨셉">
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="choice"
                aria-pressed={conceptId === c.id}
                onClick={() => pickConcept(c.id)}
              >
                <b>{c.bookingName}</b>
                {conceptNote(c) && <small>{conceptNote(c)}</small>}
              </button>
            ))}
          </div>

          {/* 증명·프로필: 세부 상품 */}
          {concept && concept.variants.length > 1 && (
            <SubChoices label="세부 상품">
              {concept.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="choice"
                  aria-pressed={variantId === v.id}
                  onClick={() => setVariantId(v.id)}
                >
                  <b>{v.name}</b>
                  {v.note && <small>{v.note}</small>}
                </button>
              ))}
            </SubChoices>
          )}

          {/* 필수 선택: 모든 컨셉 공통. 금액은 고른 컨셉(세부 상품) 기준 */}
          <SubChoices label="필수 선택">
            {PLANS.map((p) => (
              <button key={p.id} type="button" className="choice" aria-pressed={plan === p.id} onClick={() => setPlan(p.id)}>
                <b>{p.name}</b>
                <span className="p">{variant ? priceLabel(variant.plans[p.id]) : "컨셉을 먼저 골라주세요"}</span>
                <small>{p.includes.join(" · ")}</small>
              </button>
            ))}
          </SubChoices>
        </div>

        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 2</span>
            <h3 className="t-kr">날짜와 시간</h3>
          </div>
          {/* 달력(오늘부터 3주) + 고른 날의 예약 가능 시간 */}
          <div className="appt">
            <Calendar
              mode="single"
              required
              selected={toDate(day)}
              onSelect={(d) => {
                const a = d ? days.findIndex((x) => x.key === dateKey(d)) : -1;
                if (a >= 0) pickDate(a);
              }}
              defaultMonth={toDate(day)}
              startMonth={toDate(days[0])}
              endMonth={toDate(days[days.length - 1])}
              disabled={(d) => {
                const x = days.find((x) => x.key === dateKey(d));
                return !x || firstOpenSlot(now, x) === null;
              }}
            />
            <div className="appt-times">
              <p className="t-kr" style={{ fontSize: 17, lineHeight: "26px" }}>
                {day.m + 1}월 {day.d}일({DOW[day.w]}) 예약 가능 시간
              </p>
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
            </div>
          </div>
          <div className="legend cap muted">
            <span>매일 10:00~21:50 · 1회 이용 1시간 20분</span>
            <span>선이 그어진 날짜·시간은 마감이에요</span>
          </div>
        </div>

        <div className="bstep">
          <div className="bstep-h">
            <span className="index">STEP 3</span>
            <h3 className="t-kr">추가 선택</h3>
          </div>
          <Counter label="어른·만 8세 이상" help="기준 인원 1~2명" value={adults} min={1} onChange={setAdults} noun="어른" />
          <Counter label="만 7세 이하" help="1명 무료, 2명부터 인원 추가"
            note="나이 확인을 위해 증빙 서류를 요청드릴 수 있어요."
            value={kids} min={0} onChange={setKids} noun="아이" />
          <p className="cap muted" style={{ margin: "10px 0 var(--space-6)" }}>
            <Sentences
              text={
                extra
                  ? `인원 추가 ${extra}명이 함께 결제돼요 (+${formatKRW(extra * EXTRA_PERSON_PRICE)}).`
                  : "추가 요금 없이 촬영할 수 있는 인원이에요."
              }
            />
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
                    <small>
                      <Sentences text={(off ? ext.why : (o.bookingDesc ?? o.desc)) ?? ""} />
                    </small>
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
                <input id="b-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="b-phone">휴대폰 번호</label>
                <input
                  id="b-phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {/* 차량번호 (선택): 지하 주차장 사전 등록용. 형식 검사 없음, 앞뒤 공백만 정리해서 저장 */}
              <div className="field" style={{ gridColumn: "1/-1" }}>
                <label htmlFor="b-car">차량번호 (선택)</label>
                <input
                  id="b-car"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="예) 12가 3456"
                  aria-describedby="b-car-help"
                  value={carNo}
                  onChange={(e) => setCarNo(e.target.value)}
                />
                <span id="b-car-help" className="cap muted">
                  <Sentences text="지하 주차장 무료 이용을 위해 사전 등록이 필요해요. 차량으로 오시면 입력해 주세요." />
                </span>
              </div>
              <div className="field" style={{ gridColumn: "1/-1" }}>
                <label htmlFor="b-email">이메일</label>
                <input
                  id="b-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  aria-describedby="b-email-help"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span id="b-email-help" className="cap muted">
                  예약 조회 로그인과 사진 링크 발송에 쓰여요.
                </span>
              </div>
            </div>
            <div className="policy">
              <b>예약 변경·취소 안내</b>
              <ul>
                {POLICY.map((t) => (
                  <li key={t}>
                    <Sentences text={t} />
                  </li>
                ))}
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
          {carNo.trim() && <SumRow k="차량번호" v={carNo.trim()} />}
          <SumRow k="기본" v={price ? priceLabel(price) : "-"} />
          {extra > 0 && <SumRow k={`인원 추가 ${extra}명`} v={formatKRW(extra * EXTRA_PERSON_PRICE)} />}
          {OPTIONS.filter((o) => selected(o.id)).map((o) => (
            <SumRow key={o.id} k={o.shortName ?? o.name} v={o.price ? formatKRW(o.price) : "무료"} />
          ))}
        </dl>
        {price && !payable ? (
          // 금액이 '문의'(시즌 컨셉, 증명·프로필 패키지 등)면 결제 대신 카카오톡 문의
          <>
            <div className="total">
              <span className="cap muted">결제 금액</span>
              <b className="ask-total">{priceLabel(price)}</b>
            </div>
            <p className="cap muted" style={{ margin: "0 0 var(--space-4)" }}>
              <Sentences text="이 구성은 금액을 따로 안내해 드려요. 카카오톡 채널 '블루티티'로 문의해 주세요." />
            </p>
            <KakaoChatButton className="btn btn-primary" style={{ width: "100%" }}>
              카카오톡으로 문의하기
            </KakaoChatButton>
          </>
        ) : (
          <>
            <div className="total">
              <span className="cap muted">결제 금액</span>
              <b className="num">{formatKRW(total)}</b>
            </div>
            <p className="err" role="alert">
              <Sentences text={err} />
            </p>
            <button className="btn btn-primary" type="button" style={{ width: "100%" }} onClick={pay}>
              결제하고 예약 확정
            </button>
            <p className="cap muted" style={{ margin: "var(--space-4) 0 0" }}>
              <Sentences text="카드·간편결제로 선결제해요. 현장 결제는 없어요." />
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

function SubChoices({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: "var(--space-4)" }}>
      <p className="cap muted" style={{ margin: "0 0 8px" }}>
        {label}
      </p>
      <div className="choices" role="group" aria-label={label}>
        {children}
      </div>
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

function Counter(props: {
  label: string;
  help: string;
  /** help 아래 추가 안내 (같은 캡션 스타일) */
  note?: string;
  value: number;
  min: number;
  noun: string;
  onChange: (n: number) => void;
}) {
  const { label, help, note, value, min, noun, onChange } = props;
  return (
    <div className="counter-row">
      <div>
        <b>{label}</b>
        <div className="cap muted">{help}</div>
        {note && <div className="cap muted">{note}</div>}
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
