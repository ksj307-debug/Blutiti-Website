"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 30분 로그인 만료 시점에 로그인 화면으로 이동 (서버도 만료된 세션은 거부) */
export function SessionTimer({ expiresAt }: { expiresAt: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/login"), Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(t);
  }, [expiresAt, router]);
  return null;
}
