import type { Metadata } from "next";
import { Cormorant_Garamond, Gowun_Batang, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { KakaoSdkLoader } from "@/components/site/kakao";
import { FloatingActions } from "@/components/site/floating-actions";

// Pretendard 는 styles/blutiti-tokens.css 의 @font-face(public/fonts) 로 로드
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const gowun = Gowun_Batang({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "블루티티 셀프스튜디오",
  description: "안산 초지역 셀프 사진관 블루티티. 세팅은 끝났어요, 리모콘 버튼만 누르고 웃어주세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${gowun.variable} ${plexMono.variable}`}
    >
      <body>
        {children}
        {/* 오른쪽 아래 '맨 위로' + 카카오톡 채널 채팅 (모든 페이지 공통) */}
        <FloatingActions />
        <KakaoSdkLoader />
      </body>
    </html>
  );
}
