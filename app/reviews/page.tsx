import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ReviewGroups } from "./review-groups";
import { NAVER_URL } from "@/lib/reviews";

export const metadata: Metadata = { title: "리뷰 · 블루티티 셀프스튜디오" };

/** 리뷰 전체 (레퍼런스의 #reviews 화면을 별도 페이지로) */
export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="band wrap">
          <Link className="link" href="/#review">
            ← 홈으로
          </Link>
          <div className="rp-head">
            <div className="section-head" style={{ margin: "var(--space-10) 0 0" }}>
              <p className="eyebrow">REVIEW · NAVER</p>
              <h1 className="display" style={{ fontSize: "clamp(44px,7vw,72px)" }}>
                All <em>the</em> reviews
              </h1>
              <p className="h-kr" style={{ fontSize: 22, lineHeight: "34px" }}>
                다녀간 가족들이 남긴 이야기
              </p>
              <p className="muted cap" style={{ margin: 0 }}>
                네이버 예약 방문자 리뷰를 컨셉별로 모았어요. 카드를 누르면 네이버에서 원문을 확인할 수 있어요.
              </p>
            </div>
            <a className="btn" href={NAVER_URL} target="_blank" rel="noopener">
              네이버에서 전체 리뷰 보기 ↗
            </a>
          </div>
          <ReviewGroups />
          <div className="rp-foot">
            <p className="t-kr">더 많은 리뷰는 네이버에서 확인하세요</p>
            <p className="muted cap">리뷰나 블로그 글을 남겨주시면 보정 1컷을 무료로 드려요.</p>
            <a className="btn" href={NAVER_URL} target="_blank" rel="noopener">
              네이버에서 전체 리뷰 보기 ↗
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
