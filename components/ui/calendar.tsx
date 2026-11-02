"use client";

/**
 * Calendar (원본: shadcn calendar · 21st.dev calendar-03 예약 달력)
 * 원본 대비 수정 사항
 * - react-day-picker v9 API 로 변경 (원본 classNames 는 v8 키 · v8 은 React 19 미지원)
 * - shadcn Button·lucide 아이콘 대신 사이트 스타일(styles/site.css .cal-*)과 1px 라인 화살표
 * - 한국어(ko) 요일·월 표기, 일요일 시작
 * - 디자인 시스템: radius 0, 그림자 없음, 선택된 날짜 = titi-sky 배경 + titi-cobalt 테두리
 */
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { cn } from "@/lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Chevron({ orientation }: { orientation?: "up" | "down" | "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={orientation === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays={showOutsideDays}
      className={cn("cal", className)}
      classNames={{
        months: "cal-months",
        month: "cal-month",
        month_caption: "cal-caption",
        caption_label: "cal-caption-label",
        nav: "cal-nav",
        button_previous: "cal-nav-btn",
        button_next: "cal-nav-btn",
        month_grid: "cal-grid",
        weekdays: "cal-weekdays",
        weekday: "cal-weekday",
        week: "cal-week",
        day: "cal-day",
        day_button: "cal-day-btn",
        selected: "cal-selected",
        today: "cal-today",
        outside: "cal-outside",
        disabled: "cal-disabled",
        hidden: "cal-hidden",
        ...classNames,
      }}
      components={{ Chevron }}
      {...props}
    />
  );
}
