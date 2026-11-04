import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ToTop } from "@/components/site/to-top";
import { getSession } from "@/lib/auth";
import { findBookings, type StoredBooking } from "@/lib/bookings";
import { bookingLabel, formatKRW } from "@/lib/concepts";
import { logout } from "../login/actions";
import { DemoButtons } from "./demo-buttons";
import { SessionTimer } from "./session-timer";

export const metadata: Metadata = { title: "예약 조회 · 블루티티 셀프스튜디오" };

/** 진행 단계 (레퍼런스 예약 조회 화면) */
const STAGES: { title: string; note?: string }[] = [
  { title: "예약 확정" },
  { title: "촬영 완료" },
  { title: "원본 전달", note: "웹사이즈 원본을 Google Drive로 보내드렸어요." },
  { title: "셀렉 대기", note: "보정·인화할 사진 2장을 골라주세요." },
  { title: "보정·제작" },
  { title: "우편 발송", note: "송장번호가 여기에 표시돼요." },
  { title: "완료" },
];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 저장 데이터는 그대로, 화면 표기만 새 형식 ('베이직 컬러 · 패키지') */
const productLabel = (b: StoredBooking) => bookingLabel(b.concept, b.product);
const dateLabel = (b: StoredBooking) => {
  const [y, m, d] = b.date.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}월 ${d}일(${DOW[w]}) ${b.start}~${b.end}`;
};
/** 사진 보관: 촬영일 기준 3개월 */
const daysLeft = (b: StoredBooking) => {
  const [y, m, d] = b.date.split("-").map(Number);
  const expire = Date.UTC(y, m - 1 + 3, d) - 9 * 3600e3;
  return Math.ceil((expire - Date.now()) / 86400e3);
};

export default function MyBookingPage({ searchParams }: PageProps<"/my-booking">) {
  return (
    <>
      <Header />
      <main>
        <section className="alt band" aria-labelledby="look-h">
          <div className="wrap">
            <div className="rp-head" style={{ marginBottom: "var(--space-10)" }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <p className="eyebrow">MY BOOKING</p>
                <h1 id="look-h" className="h-kr">
                  예약 조회
                </h1>
                <p className="muted cap" style={{ margin: 0 }}>
                  로그인은 30분 동안 유지돼요.
                </p>
              </div>
              <form action={logout}>
                <button className="btn" type="submit">
                  로그아웃
                </button>
              </form>
            </div>
            <Suspense fallback={<p className="cap muted">예약을 불러오는 중이에요.</p>}>
              <MyBookings searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <ToTop />
    </>
  );
}

/** 로그인 세션 확인 후 예약 목록(여러 건) 또는 상세(1건·선택) */
async function MyBookings({ searchParams }: Pick<PageProps<"/my-booking">, "searchParams">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const bookings = findBookings(session.email, session.last4);
  const { id } = await searchParams;
  const selected = bookings.length === 1 ? bookings[0] : bookings.find((b) => b.id === id);

  return (
    <>
      <SessionTimer expiresAt={session.expiresAt} />
      {selected ? (
        <BookingDetail booking={selected} backToList={bookings.length > 1} />
      ) : (
        <BookingList bookings={bookings} />
      )}
    </>
  );
}

function BookingList({ bookings }: { bookings: StoredBooking[] }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <p className="sub-h">예약 {bookings.length}건 · 촬영일 최신순</p>
      <ul className="booking-list">
        {bookings.map((b) => (
          <li key={b.id}>
            <Link href={`/my-booking?id=${encodeURIComponent(b.id)}`}>
              <span className="t-kr">{productLabel(b)}</span>
              <span className="index">{STAGES[b.stage - 1].title}</span>
              <span className="cap muted num">
                {b.id} · {dateLabel(b)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BookingDetail({ booking: b, backToList }: { booking: StoredBooking; backToList: boolean }) {
  const left = daysLeft(b);
  return (
    <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 720 }}>
      {backToList && (
        <Link className="link" href="/my-booking" style={{ justifySelf: "start" }}>
          ← 예약 목록
        </Link>
      )}
      <div className="panel" aria-live="polite">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <p className="eyebrow">{b.id}</p>
          <span className="demo-note">예시 예약</span>
        </div>
        <dl className="kv">
          <dt>상품</dt>
          <dd>{productLabel(b)}</dd>
          <dt>촬영</dt>
          <dd className="num">{dateLabel(b)}</dd>
          <dt>인원</dt>
          <dd>
            어른 {b.adults}명{b.kids ? `, 만 7세 이하 ${b.kids}명` : ""}
          </dd>
        </dl>
        <ol className="track">
          {STAGES.map((s, i) => {
            const n = i + 1;
            const state = n < b.stage || b.stage === 7 ? "done-s" : n === b.stage ? "now" : "";
            const note = n === 1 ? `결제 ${formatKRW(b.paid)} 완료` : n === 6 && b.trackingNo ? `송장번호 ${b.trackingNo}` : s.note;
            return (
              <li key={s.title} className={state}>
                <span className="dot">{state === "done-s" ? "✓" : n}</span>
                <div>
                  <p className="t-kr">{s.title}</p>
                  {note && <p className="cap muted">{note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
        {b.stage < 7 && <DemoButtons />}
        <div
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "var(--space-4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <span className="cap muted">사진 보관 · 촬영일 기준 3개월 후 삭제돼요</span>
          <span className="dday num">{left > 0 ? `D-${left}` : "보관 기간 종료"}</span>
        </div>
      </div>
    </div>
  );
}
