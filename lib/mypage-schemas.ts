import { z } from "zod";

/**
 * 마이페이지 입력 검증 (zod). 서버 API 가 쓰고, 나중에 화면 폼에서도 같이 쓸 수 있게 비밀값 없이 분리
 */

/** 진행상태 7단계 (DB bookings.progress check 제약과 같음) */
export const PROGRESS_STAGES = ["촬영 완료", "원본 전달", "셀렉 완료", "보정 중", "보정본 확인", "인화·발송", "완료"] as const;

/** 답변 종류: 셀렉(보정·인화할 컷) / 추가 주문 / 문의 */
export const RESPONSE_TYPES = ["select", "order", "inquiry"] as const;
export type ResponseType = (typeof RESPONSE_TYPES)[number];

/** 답변 안의 글자 수 합계 상한 */
export const RESPONSE_MAX_CHARS = 2000;

export const loginSchema = z.object({
  name: z.string().trim().min(1).max(50),
  phone4: z.string().regex(/^\d{4}$/),
});

const bookingNo = z.string().trim().min(1).max(64);

/** type 별 content */
export const responseSchema = z.discriminatedUnion("type", [
  z.object({
    booking_no: bookingNo,
    type: z.literal("select"),
    // 2026-11 셀렉 질문 6개 (My Page 상세 '셀렉' 탭). 1번(retouch_files)만 필수
    // 예전 형식 { cuts: "12, 35, 48" } 은 새로 받지 않음 (DB 에 저장된 예전 답변은 그대로, 화면에서 '이전 답변'으로 표시)
    content: z.strictObject({
      retouch_files: z.string().trim().min(1), // 1) 보정·인화할 사진 파일명 (기본 2장)
      review_event_files: z.string().trim().optional(), // 2) 무료보정 이벤트(네이버 리뷰) 파일명
      sns_consent: z.boolean(), // 3) 무료 고화질 원본 이벤트: SNS 활용 동의
      option_files: z.string().trim().optional(), // 4) 추가 옵션명 + 파일명
      lettering_request: z.string().trim().optional(), // 5) 레터링 문구
      retouch_request: z.string().trim().optional(), // 6) 특별히 보정을 원하는 부분
    }),
  }),
  z.object({
    booking_no: bookingNo,
    type: z.literal("order"),
    content: z.strictObject({
      items: z.array(z.string().trim().min(1)).min(1),
      memo: z.string().trim().optional(),
    }),
  }),
  z.object({
    booking_no: bookingNo,
    type: z.literal("inquiry"),
    content: z.strictObject({ message: z.string().trim().min(1) }),
  }),
]);
export type ResponseInput = z.infer<typeof responseSchema>;

/** content 안 모든 문자열 길이 합 */
export function totalChars(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.reduce((sum: number, v) => sum + totalChars(v), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum: number, v) => sum + totalChars(v), 0);
  return 0;
}
