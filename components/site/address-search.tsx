"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 카카오(다음) 우편번호 서비스 스크립트. 누를 때 한 번만 불러옴
 * 카카오 공지: t1.daumcdn.net 도메인 종료 → t1.kakaocdn.net 으로 변경 (같은 파일)
 */
const POSTCODE_SRC = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type PostcodeData = { zonecode: string; roadAddress: string; jibunAddress: string; userSelectedType: "R" | "J"; buildingName: string };
type PostcodeCtor = new (opts: {
  oncomplete: (data: PostcodeData) => void;
  onclose?: () => void;
  width: string;
  height: string;
}) => { embed: (el: HTMLElement) => void };
declare global {
  interface Window {
    daum?: { Postcode: PostcodeCtor };
  }
}

let loading: Promise<void> | null = null;
function loadPostcode() {
  if (window.daum?.Postcode) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = POSTCODE_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("postcode"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type Address = { zonecode: string; base: string };

/**
 * '주소 검색' 버튼 + 검색 창 (카카오 우편번호 서비스)
 * - 검색 창은 화면 전체를 덮는 레이어 (모바일), 데스크톱은 가운데 큰 창
 * - 고르면 우편번호·기본 주소를 넘겨주고 창을 닫음. 상세 주소 입력칸은 부모에서
 */
export function AddressSearch({ onPick, labelledBy }: { onPick: (a: Address) => void; labelledBy?: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !boxRef.current) return;
    const box = boxRef.current;
    let cancelled = false;
    loadPostcode()
      .then(() => {
        if (cancelled || !window.daum) return;
        new window.daum.Postcode({
          width: "100%",
          height: "100%",
          oncomplete: (d) => {
            const base = (d.userSelectedType === "R" ? d.roadAddress : d.jibunAddress) + (d.buildingName ? ` (${d.buildingName})` : "");
            onPick({ zonecode: d.zonecode, base });
            setOpen(false);
          },
        }).embed(box);
      })
      .catch(() => setFailed(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // 뒤 화면이 스크롤되지 않게
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onPick]);

  return (
    <>
      <button type="button" className="btn-secondary addr-btn" aria-describedby={labelledBy} onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
      >
        주소 검색
      </button>
      {open && (
        <div className="addr-layer" role="dialog" aria-modal="true" aria-label="주소 검색">
          <div className="addr-panel">
            <div className="addr-head">
              <b>주소 검색</b>
              <button type="button" className="addr-close" aria-label="닫기" onClick={() => setOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="addr-box" ref={boxRef}>
              {failed && <p className="cap muted" style={{ padding: 16 }}>주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
