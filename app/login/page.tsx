import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Sentences } from "@/components/site/sentences";
import { getSession } from "@/lib/auth";
import { DEMO_LOGIN } from "@/lib/bookings";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "예약 조회 로그인 · 블루티티 셀프스튜디오" };

/** 이미 로그인한 상태면 바로 예약 조회로 */
async function RedirectIfLoggedIn() {
  if (await getSession()) redirect("/my-booking");
  return null;
}

/** 예약 조회 로그인: 회원가입 없이 이메일 + 휴대폰 뒷 4자리 */
export default function LoginPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={null}>
          <RedirectIfLoggedIn />
        </Suspense>
        <section className="alt band" aria-labelledby="login-h">
          <div className="wrap" style={{ maxWidth: 520 }}>
            <div className="section-head" style={{ marginBottom: "var(--space-6)" }}>
              <p className="eyebrow">MY BOOKING</p>
              <h1 id="login-h" className="h-kr">
                예약 조회
              </h1>
              <p className="muted cap" style={{ margin: 0 }}>
                <Sentences text="회원가입 없이 예약할 때 입력한 이메일과 휴대폰 뒷자리로 확인해요. 사진 전달과 셀렉도 여기서 이어서 해요." />{" "}
                <span className="demo-note">미리보기 화면이라 예시 예약을 보여드려요</span>
              </p>
            </div>
            <LoginForm defaults={DEMO_LOGIN} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
