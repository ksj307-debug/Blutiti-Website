"use client";

import { useState } from "react";

/** 셀렉·다운로드·추가 주문 (오픈 후 실제 링크 연결 전까지 안내 문구만) */
const ACTIONS = [
  { label: "사진 셀렉하기", msg: "셀렉 Google Form은 오픈 후 연결돼요.", primary: true },
  { label: "사진 다운로드", msg: "사진 다운로드는 오픈 후 Google Drive 링크로 연결돼요." },
  { label: "추가 주문", msg: "추가 주문(보정·인화·액자)은 오픈 후 결제와 함께 연결돼요." },
];

export function DemoButtons() {
  const [msg, setMsg] = useState("");
  return (
    <>
      {/* data-own-cta: '사진 셀렉하기'(코발트)가 보이는 동안 헤더 예약하기는 보조 버튼 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} data-own-cta>
        {ACTIONS.map((a) => (
          <button key={a.label} className={a.primary ? "btn btn-primary" : "btn"} type="button" onClick={() => setMsg(a.msg)}>
            {a.label}
          </button>
        ))}
      </div>
      <p className="cap muted" role="status">
        {msg}
      </p>
    </>
  );
}
