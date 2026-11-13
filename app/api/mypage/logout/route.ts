import { clearMypageSession } from "@/lib/mypage-session";
import { json } from "@/lib/mypage-http";

/** POST /api/mypage/logout: 세션 쿠키 삭제 */
export async function POST() {
  await clearMypageSession();
  return json({ ok: true });
}
