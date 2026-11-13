"use client";

import { useEffect, useRef, useState } from "react";
import { NAVER_MAP_CLIENT_ID } from "@/lib/studio-info";

/**
 * 네이버 지도 (네이버 클라우드 Maps · Dynamic Map, JavaScript API v3)
 * - 스크립트: oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=… (예전 파라미터 ncpClientId 아님)
 * - 페이지 첫 로딩을 늦추지 않게, 지도 자리가 화면에 가까워지면(200px 전) 스크립트를 불러옴
 * - 모바일(860px 이하·터치): 지도는 터치를 받지 않아 손가락으로 쓸면 페이지가 스크롤됨. 확대·축소 버튼만 동작
 * - 데스크톱: 끌어서 이동 가능, 마우스 휠 확대는 끔 (페이지 스크롤 방해 방지)
 * - 키가 없거나 인증 실패·좌표 없음: 회색(--mist) 박스 + 주소만. 원인은 콘솔에만 남김 (고객에게 오류 문구 안 보임)
 */

type LatLng = unknown;
type NaverMapInstance = { getZoom(): number; setZoom(z: number, effect?: boolean): void };
type NaverMaps = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => NaverMapInstance;
  LatLng: new (lat: number, lng: number) => LatLng;
  Marker: new (opts: Record<string, unknown>) => unknown;
  Point: new (x: number, y: number) => unknown;
  Position: { BOTTOM_LEFT: unknown };
};
declare global {
  interface Window {
    naver?: { maps: NaverMaps };
    /** 네이버 지도 인증 실패 시 네이버가 부르는 전역 함수 */
    navermap_authFailure?: () => void;
  }
}

const SCRIPT_BASE = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=";
let scriptPromise: Promise<void> | null = null;
function loadNaverMaps(keyId: string) {
  if (window.naver?.maps) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_BASE + encodeURIComponent(keyId);
    s.async = true;
    s.onload = () => (window.naver?.maps ? resolve() : reject(new Error("naver.maps 없음")));
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("스크립트를 불러오지 못함 (네트워크 또는 차단)"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** 모바일 판단: 860px 이하이거나 손가락 터치 기기 */
const isTouchLayout = () => window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;

export function NaverMap({
  lat,
  lng,
  label,
  address,
  zoom = 16,
  largeMapUrl,
}: {
  lat: number | null;
  lng: number | null;
  /** 핀 위 라벨 */
  label: string;
  /** 지도를 못 그릴 때 회색 박스 안에 보여줄 주소 */
  address: string;
  zoom?: number;
  /** '네이버 지도에서 크게 보기' 링크 */
  largeMapUrl: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NaverMapInstance | null>(null);
  const keyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || NAVER_MAP_CLIENT_ID;
  const ready = !!keyId && lat !== null && lng !== null;
  const [status, setStatus] = useState<"idle" | "ok" | "failed">("idle");
  const [touch, setTouch] = useState(false);

  // 준비가 안 됐으면 원인만 콘솔에 (화면은 회색 박스)
  useEffect(() => {
    if (!keyId) console.warn("[네이버 지도] NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 비어 있어 지도 대신 주소만 표시해요.");
    else if (lat === null || lng === null) console.warn("[네이버 지도] lib/studio-info.ts 의 위도·경도가 비어 있어 지도 대신 주소만 표시해요.");
  }, [keyId, lat, lng]);

  useEffect(() => {
    if (!ready || !boxRef.current) return;
    const box = boxRef.current;
    let cancelled = false;

    const start = () => {
      window.navermap_authFailure = () => {
        console.error(
          "[네이버 지도] 인증 실패: Client ID 오타, Maps 앱에 Dynamic Map 미선택, 또는 Web 서비스 URL 에 지금 주소(" +
            window.location.origin +
            ")가 등록되지 않았을 수 있어요.",
        );
        if (!cancelled) setStatus("failed");
      };
      loadNaverMaps(keyId)
        .then(() => {
          if (cancelled || !canvasRef.current || !window.naver) return;
          const nm = window.naver.maps;
          const touchLayout = isTouchLayout();
          setTouch(touchLayout);
          const center = new nm.LatLng(lat as number, lng as number);
          const map = new nm.Map(canvasRef.current, {
            center,
            zoom,
            // 기본 컨트롤은 끄고 직접 만든 작은 확대·축소 버튼 사용
            zoomControl: false,
            mapDataControl: false,
            scaleControl: false,
            mapTypeControl: false,
            // 네이버 로고는 가리면 안 돼서 확대·축소 버튼과 겹치지 않게 왼쪽 아래로
            logoControlOptions: { position: nm.Position.BOTTOM_LEFT },
            // 모바일: 지도는 터치를 받지 않음 (페이지 스크롤 우선). 데스크톱: 끌기만 허용, 휠 확대 끔
            draggable: !touchLayout,
            pinchZoom: false,
            scrollWheel: false,
            keyboardShortcuts: false,
            disableDoubleTapZoom: true,
            disableDoubleClickZoom: true,
            disableTwoFingerTapZoom: true,
          });
          new nm.Marker({
            position: center,
            map,
            icon: {
              content: `<div class="nm-pin"><span class="nm-label">${label}</span><span class="nm-dot" aria-hidden="true"></span></div>`,
              anchor: new nm.Point(0, 0),
            },
          });
          mapRef.current = map;
          setStatus("ok");
        })
        .catch((e: Error) => {
          console.error("[네이버 지도] " + e.message);
          if (!cancelled) setStatus("failed");
        });
    };

    // 지도 자리가 화면 200px 앞까지 오면 불러오기
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(box);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [ready, keyId, lat, lng, zoom, label]);

  const zoomBy = (d: 1 | -1) => {
    const map = mapRef.current;
    if (map) map.setZoom(map.getZoom() + d, true);
  };

  // 키·좌표가 없거나 인증 실패: 회색 박스 + 주소만
  if (!ready || status === "failed") {
    return (
      <div className="naver-map naver-map-fallback" ref={boxRef}>
        <p className="naver-map-address">{address}</p>
      </div>
    );
  }

  return (
    <div className="naver-map" ref={boxRef} data-touch={touch || undefined}>
      <div className="naver-map-canvas" ref={canvasRef} role="img" aria-label={`${label} 위치 지도. ${address}`} />
      {status === "ok" && (
        <>
          <a className="naver-map-large" href={largeMapUrl} target="_blank" rel="noopener">
            네이버 지도에서 크게 보기
          </a>
          <div className="naver-map-zoom" role="group" aria-label="지도 확대·축소">
            <button type="button" aria-label="지도 확대" onClick={() => zoomBy(1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" aria-label="지도 축소" onClick={() => zoomBy(-1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
