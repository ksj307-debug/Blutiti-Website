import "server-only";

/** 마이페이지 API 응답: 캐시 금지 + 짧은 한글 오류 메시지 */
const NO_STORE = { "Cache-Control": "no-store" };

export const MSG = {
  badRequest: "요청 내용을 확인해 주세요",
  notFound: "일치하는 예약을 찾지 못했어요",
  tooMany: "잠시 후 다시 시도해 주세요",
  unauthorized: "다시 로그인해 주세요",
  forbidden: "이 예약에 대한 권한이 없어요",
  tooLong: "내용은 2,000자 이내로 적어 주세요",
  server: "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요",
} as const;

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: NO_STORE });
}

export function fail(status: number, message: string) {
  return json({ error: message }, status);
}

/** 요청 본문 JSON. 형식이 틀리면 undefined */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
