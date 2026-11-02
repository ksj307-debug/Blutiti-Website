import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { Message } from "@/components/sections/message";
import { Guide } from "@/components/sections/guide";
import { Concept } from "@/components/sections/concept";
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
      <main id="top">
        <Hero />
        <Message />
        <Guide />
        <Concept />
        <ForYou />
        <Gallery />
        <Price />
        <Review />
        <Booking />
        <FaqLocation />
      </main>
      <Footer />
    </>
  );
}
