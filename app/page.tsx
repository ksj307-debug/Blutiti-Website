import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { localBusinessJsonLd } from "@/lib/seo";
import { Footer } from "@/components/site/footer";
import HeroSection from "@/components/sections/hero-section";
import { Message } from "@/components/sections/message";
import { Guide } from "@/components/sections/guide";
import ConceptSection from "@/components/sections/concept-section";
import { ForYou } from "@/components/sections/for-you";
import { Gallery } from "@/components/sections/gallery";
import { Price } from "@/components/sections/price";
import { Review } from "@/components/sections/review";
import { Booking } from "@/components/sections/booking";
import { FaqLocation } from "@/components/sections/faq-location";

/** 메인. 예약 조회(/my-booking·/login)는 별도 페이지. Our Story(/our-story)는 2026-11 삭제 (주소는 메인으로 이동) */
/** 메인 대표 주소 (vercel.app 등 다른 주소로 열려도 검색엔진에는 blutiti.com 으로) */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      {/* 매장 정보 구조화 데이터 (검색 결과의 상호·주소·영업시간·전화). 값은 lib/seo.ts */}
      {/* '<' 는 유니코드 표기로 바꿔 넣어 스크립트 태그가 중간에 끊기지 않게 함 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c") }}
      />
      <Header />
      {/* id="top" 은 히어로 섹션에 있음 */}
      <main>
        <HeroSection />
        <Message />
        {/* 순서 = 메뉴 순서 (GUIDE · CONCEPTS · PRICE · REVIEW · LOCATION). FOR YOU 는 메뉴에 없음 */}
        <ForYou />
        <Guide />
        <ConceptSection />
        <Gallery />
        <Price />
        <Review />
        <Booking />
        <FaqLocation />
      </main>
      <Footer />
      {/* 맨 위로 버튼은 루트 레이아웃 FloatingActions 로 옮김 */}
    </>
  );
}
