import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MypageApp } from "./mypage-app";

export const metadata: Metadata = {
  title: "마이페이지 · 블루티티 셀프스튜디오",
  // 고객 전용 화면이라 검색 노출 안 함
  robots: { index: false, follow: false },
};

/**
 * /mypage: 이름 + 휴대폰 뒷 4자리로 로그인 → 내 예약·진행 상태·사진·셀렉/추가 주문/문의
 * - 로그인 상태는 서버 API(/api/mypage/*)의 httpOnly 쿠키로 유지. 화면은 클라이언트에서 API 를 호출
 * - 헤더 메뉴에는 아직 링크 없음 (주소로 직접 접속)
 */
export default function MypagePage() {
  return (
    <>
      <Header />
      <main>
        <section className="alt band mp" aria-labelledby="mp-h">
          <div className="wrap">
            <MypageApp />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
