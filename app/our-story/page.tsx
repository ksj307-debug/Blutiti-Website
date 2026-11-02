import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = { title: "Our Story · 블루티티 셀프스튜디오" };

/** OUR STORY (메인에서 분리, 내용은 레퍼런스 그대로) */
export default function OurStoryPage() {
  return (
    <>
      <Header />
      <main>
        <section className="night band" aria-labelledby="story-h">
          <div className="wrap night-grid">
            <div style={{ display: "grid", gap: "var(--space-6)" }}>
              <p className="eyebrow">OUR STORY</p>
              <h1 id="story-h" className="display">
                Every family <em>deserves</em> one
              </h1>
              <p className="h-kr" style={{ fontSize: 24, lineHeight: "36px" }}>
                모든 가족에게 사진 한 장의 추억을
              </p>
              <p className="muted" style={{ maxWidth: 440 }}>
                블루티티는 매년 미혼모 가족과 함께 가족사진을 찍고 있어요. 함께한 시간의 기록은 곧 이곳에 남길게요.
              </p>
              <p>
                <Link className="link" href="/">
                  ← 홈으로
                </Link>
              </p>
            </div>
            <img src="/images/reference/four-bw.jpg" alt="흑백으로 담은 아이의 4컷 사진" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
