import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { BookingDetail } from "./booking-detail";

export const metadata: Metadata = {
  title: "My Page · 블루티티 셀프스튜디오",
  robots: { index: false, follow: false },
};

/**
 * /mypage/[예약번호]: 예약 상세 (진행 상태 · 사진 다운로드 · 셀렉 · 추가 주문)
 * - 예약번호는 클라이언트에서 useParams 로 읽음
 * - 로그인 세션(/api/mypage/bookings)에 없는 예약번호거나 로그인 전이면 /mypage 로 돌려보냄
 */
/**
 * 예약번호(주소)·세션에 따라 내용이 달라지는 고객 전용 화면이라 즉시 이동(instant navigation) 검사를 끔
 * (헤더가 현재 주소로 메뉴 표시를 정함 → 동적 주소에서는 미리 그려 둘 수 없음)
 */
export const instant = false;

export default function MypageDetailPage() {
  return (
    <>
      {/* 헤더는 현재 주소(usePathname)로 메뉴 표시를 정해, 동적 주소에서는 Suspense 안에서 요청 때 그림 */}
      <Suspense fallback={<div className="top-placeholder" aria-hidden="true" />}>
        <Header />
      </Suspense>
      <main>
        <section className="alt band mp" aria-labelledby="mp-h">
          <div className="wrap">
            <Suspense fallback={<p className="muted">예약을 불러오고 있어요.</p>}>
              <BookingDetail />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
