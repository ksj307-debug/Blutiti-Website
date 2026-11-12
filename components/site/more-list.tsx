"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * 모바일에서만 처음 몇 줄만 보이고 '전체 보기'로 펼치는 목록 (데스크톱·태블릿은 항상 전체)
 * - 접힌 줄은 site.css `.more-list[data-collapsed] .more-hidden` 으로 모바일(720px 이하)에서만 숨김
 * - 서버 렌더에도 모든 항목이 들어 있어 검색·스크린리더에 그대로 읽힘
 */
export function MoreList({
  items,
  visible,
  moreLabel,
  className,
}: {
  items: ReactNode[];
  /** 모바일에서 처음 보이는 줄 수 */
  visible: number;
  moreLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const hasMore = items.length > visible;
  return (
    <>
      <ul id={id} className={`more-list ${className ?? ""}`} data-collapsed={hasMore && !open ? "" : undefined}>
        {items.map((item, i) => (
          <li key={i} className={i >= visible ? "more-hidden" : undefined}>
            {item}
          </li>
        ))}
      </ul>
      {hasMore && !open && (
        <button type="button" className="more-btn" aria-controls={id} aria-expanded={false} onClick={() => setOpen(true)}>
          {moreLabel}
        </button>
      )}
    </>
  );
}
