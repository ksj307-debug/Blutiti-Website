import { RESPONSE_MAX_CHARS, responseSchema, totalChars } from "@/lib/mypage-schemas";
import { getMypageSession } from "@/lib/mypage-session";
import { MSG, fail, json, readJson } from "@/lib/mypage-http";
import { logDbError, supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/mypage/responses  { booking_no, type, content }
 * - type: select { cuts } / order { items[], memo? } / inquiry { message }
 * - 세션에 없는 예약번호면 403, 글자 수 합계 2,000자 초과면 400
 * - 기존 답변을 덮어쓰지 않고 새 행으로 추가 (가장 최근 행이 유효한 답변)
 */
export async function POST(request: Request) {
  const bookingNos = await getMypageSession();
  if (!bookingNos) return fail(401, MSG.unauthorized);

  const parsed = responseSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(400, MSG.badRequest);
  const { booking_no, type, content } = parsed.data;

  if (!bookingNos.includes(booking_no)) return fail(403, MSG.forbidden);
  if (totalChars(content) > RESPONSE_MAX_CHARS) return fail(400, MSG.tooLong);

  const inserted = await supabaseServer()
    .from("responses")
    .insert({ booking_no, type, content })
    .select("created_at")
    .single();
  if (inserted.error) {
    logDbError("responses 추가", inserted.error);
    return fail(500, MSG.server);
  }
  return json({ ok: true, created_at: inserted.data.created_at }, 201);
}
