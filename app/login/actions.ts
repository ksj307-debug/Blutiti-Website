"use server";

import { redirect } from "next/navigation";
import { clearFailures, endSession, lockRemaining, recordFailure, startSession } from "@/lib/auth";
import { findBookings } from "@/lib/bookings";

export type LoginState = { error?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 이메일·번호 중 무엇이 틀렸는지 알려주지 않음 */
const NO_MATCH = "입력하신 정보와 일치하는 예약이 없어요.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const last4 = String(formData.get("last4") ?? "").trim();

  if (!EMAIL_RE.test(email)) return { error: "이메일 주소를 확인해 주세요.", email };
  if (!/^\d{4}$/.test(last4)) return { error: "휴대폰 번호 뒷 4자리를 숫자로 입력해 주세요.", email };

  const locked = lockRemaining(email);
  if (locked > 0) {
    const min = Math.ceil(locked / 60000);
    return { error: `조회를 여러 번 실패해서 잠시 막아두었어요. ${min}분 후에 다시 시도해 주세요.`, email };
  }

  if (findBookings(email, last4).length === 0) {
    recordFailure(email);
    return { error: NO_MATCH, email };
  }

  clearFailures(email);
  await startSession(email, last4);
  redirect("/my-booking");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
