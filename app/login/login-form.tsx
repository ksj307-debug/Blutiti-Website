"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ defaults }: { defaults: { email: string; last4: string } }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} noValidate>
      <div className="field">
        <label htmlFor="l-email">이메일</label>
        <input
          id="l-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          defaultValue={state.email ?? defaults.email}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="l-ph">휴대폰 뒷 4자리</label>
        <input id="l-ph" name="last4" inputMode="numeric" maxLength={4} defaultValue={defaults.last4} required />
      </div>
      <p className="err" role="alert">
        {state.error}
      </p>
      <button className="btn" type="submit" style={{ width: "100%" }} disabled={pending}>
        {pending ? "조회하는 중" : "조회하기"}
      </button>
    </form>
  );
}
