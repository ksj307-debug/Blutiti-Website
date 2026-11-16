import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MypageApp } from "./mypage-app";

export const metadata: Metadata = {
  title: "My Page · 블루티티 셀프스튜디오",
  // 고객 전용 화면이라 검색 노출 안 함
  robots: { index: false, follow: false },
};

/**
 * /mypage (My Page): 이름 + 휴대폰 뒷 4자리로 로그인 → 예약 목록 → 상세 /mypage/[예약번호]
 * - 로그인 상태는 서버 API(/api/mypage/*)의 httpOnly 쿠키로 유지. 화면은 클라이언트에서 API 를 호출
 * - 헤더 오른쪽 사람 아이콘(aria-label "My Page")·모바일 메뉴 'My Page' 에서 들어옴
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
