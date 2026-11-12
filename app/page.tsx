import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ToTop } from "@/components/site/to-top";
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

/** 메인. 예약 조회(/my-booking·/login)와 Our Story(/our-story)는 별도 페이지 */
export default function Home() {
  return (
    <>
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
      <ToTop />
    </>
  );
}
