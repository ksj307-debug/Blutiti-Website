import type { Metadata } from "next";
import { Cormorant_Garamond, Gowun_Batang, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { KakaoSdkLoader } from "@/components/site/kakao";
import { FloatingActions } from "@/components/site/floating-actions";
import { BottomBar } from "@/components/site/bottom-bar";
import { Analytics } from "@/components/site/analytics";
import { Suspense } from "react";
import {
  OG_IMAGE,
  SEARCH_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

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

/**
 * 사이트 공통 메타데이터 (검색엔진·공유 미리보기, 값은 lib/seo.ts)
 * - 대표 주소(canonical)는 페이지마다 따로 지정 (여기서 지정하면 모든 페이지가 메인을 가리키게 됨)
 * 예전: title '블루티티 셀프스튜디오' / description '안산 초지역 셀프 사진관 블루티티. 세팅은 끝났어요, 리모콘 버튼만 누르고 웃어주세요.'
 */
export const metadata: Metadata = {
  // 사이트 기본 주소 (2026-11-23 blutiti.com 연결). 공유 미리보기 등 절대 주소의 기준
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  robots: { index: true, follow: true },
  verification: {
    ...(SEARCH_VERIFICATION.google ? { google: SEARCH_VERIFICATION.google } : {}),
    ...(SEARCH_VERIFICATION.naver ? { other: { "naver-site-verification": SEARCH_VERIFICATION.naver } } : {}),
  },
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
        {/* 오른쪽 아래 '맨 위로' (모든 페이지 공통, 하단 바 위) */}
        <FloatingActions />
        {/* 화면 아래 고정 바: 예약하기 · 카카오톡 문의하기 (모든 페이지 공통) */}
        <BottomBar />
        <KakaoSdkLoader />
        {/* 구글 애널리틱스 (현재 주소를 읽어 고객 전용 화면은 제외 → 동적 주소 페이지를 위해 Suspense 안) */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
