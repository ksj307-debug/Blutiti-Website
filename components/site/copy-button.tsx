"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 클립보드 권한이 없으면 아무 것도 하지 않음 (주소는 화면에서 직접 선택 가능)
    }
  };
  return (
    <button className="copy-btn" type="button" onClick={copy}>
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
