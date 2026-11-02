import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { BOOKING_HREF } from "@/lib/nav";

/** 히어로 (레퍼런스). 3단계에서 사진 마키(hero-section.tsx)로 교체 예정 */
export function Hero() {
  return (
    <section className="hero wrap" aria-label="소개">
      <figure className="hero-photo">
        <img src="/images/reference/hero.jpg" alt="초록 러그와 원목 스툴이 놓인 베이직 컬러 세트에서 노는 아이" />
        <figcaption className="ph-tag">대표 사진 자리 · 원본으로 교체 예정</figcaption>
      </figure>
      <div className="wordmark" aria-hidden="true">
        <Logo shape="horizontal" decorative />
      </div>
      <div className="hero-copy">
        <h1 className="display">
          Capture <em>our</em> little days
        </h1>
        <div className="hero-side">
          <p className="h-kr-lg">
            그날의 웃음은
            <br />
            다시 만들 수 없으니까요
          </p>
          <p className="muted">
            세팅은 끝났어요. 리모콘 버튼만 누르고 웃어주세요. 찍은 사진은 그날 바로 받아보실 수 있어요.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={BOOKING_HREF}>
              예약하기
            </Link>
            <Link className="btn" href="/#concept">
              컨셉 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
