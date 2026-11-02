"use client";

import Script from "next/script";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { KAKAO_CHANNEL_ID, KAKAO_CHAT_URL } from "@/lib/nav";

/**
 * 카카오톡 채널 1:1 채팅 (Kakao JavaScript SDK · Kakao.Channel.chat)
 * https://developers.kakao.com/docs/ko/kakaotalk-channel/js#chat
 *
 * 필요한 설정
 * - .env.local 에 NEXT_PUBLIC_KAKAO_JS_KEY = 카카오디벨로퍼스 [앱] > [앱 키] 의 JavaScript 키
 * - 카카오디벨로퍼스 [앱] > [플랫폼] > Web 에 사이트 도메인 등록 (예: http://localhost:3000, 운영 도메인)
 * 키가 없거나 SDK 를 불러오지 못하면 채널 채팅 주소(pf.kakao.com/.../chat)를 새 창으로 엶
 */
const JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

/** SDK 2.8.4 (2026.10.19 배포). integrity = 배포 파일의 SHA-384 */
const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js";
const SDK_INTEGRITY = "sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w";

type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Channel: { chat: (opts: { channelPublicId: string }) => void };
};
declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

/** 루트 레이아웃에 한 번 두는 SDK 로더. JavaScript 키가 없으면 아무것도 불러오지 않음 */
export function KakaoSdkLoader() {
  const key = JS_KEY;
  if (!key) return null;
  return (
    <Script
      src={SDK_SRC}
      integrity={SDK_INTEGRITY}
      crossOrigin="anonymous"
      strategy="lazyOnload"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(key);
      }}
    />
  );
}

/** '카카오톡 문의' 버튼: SDK 준비되면 채널 채팅 열기, 아니면 채팅 주소로 이동 */
export function KakaoChatButton({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const kakao = window.Kakao;
    if (!kakao?.isInitialized()) return;
    e.preventDefault();
    kakao.Channel.chat({ channelPublicId: KAKAO_CHANNEL_ID });
  };
  return (
    <a className={className} style={style} href={KAKAO_CHAT_URL} target="_blank" rel="noopener" onClick={onClick}>
      {children}
    </a>
  );
}
