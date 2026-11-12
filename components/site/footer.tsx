import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Sentences } from "@/components/site/sentences";
import { INSTAGRAM_URL, KAKAO_LABEL, KAKAO_URL, PHONE } from "@/lib/nav";

export function Footer() {
  return (
    <>
      <footer>
        <div className="wrap foot">
          <div style={{ display: "grid", gap: "var(--space-4)", alignContent: "start" }}>
            <Logo shape="horizontal" tone="ivory" className="logo-foot" />
            <p>
              <Sentences text="세팅은 끝났어요. 버튼만 누르고 웃어주세요." />
            </p>
            <p>
              <Link className="link" href="/our-story">
                Our Story
              </Link>
            </p>
          </div>
          <div id="contact">
            <p className="eyebrow">CONTACT</p>
            <p>
              <a href={KAKAO_URL} target="_blank" rel="noopener">
                {KAKAO_LABEL}
              </a>
              <br />
              인스타그램{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
                @blutiti_studio
              </a>
              <br />
              {PHONE}
            </p>
          </div>
          <div>
            <p className="eyebrow">STUDIO</p>
            <p>
              경기 안산시 단원구 화랑로 130
              <br />
              2동 2층 207호 · 매일 10:00~21:50
              <br />
              사업자 정보는 오픈 시 표시
            </p>
          </div>
        </div>
      </footer>

      {/* 하단 고정 바(카카오톡 문의·예약하기)는 뺌. components/site/mobile-bar.tsx 는 보관 */}
    </>
  );
}
