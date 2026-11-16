# 배포 준비 (Vercel)

## 1. 환경변수 (Vercel → 프로젝트 → Settings → Environment Variables)

값은 `.env.local`에 있는 값을 그대로 복사해 넣어요. 이 문서와 코드에는 값을 쓰지 않아요.
모두 **서버 전용**이라 이름 앞에 `NEXT_PUBLIC_`을 붙이지 않아요.

| 이름 | 쓰는 곳 | 넣을 환경 | Sensitive |
|---|---|---|---|
| `SUPABASE_URL` | Supabase 접속 주소 (`https://xxxx.supabase.co`, 뒤에 경로 없이) | Production, Preview | 선택 |
| `SUPABASE_SECRET_KEY` | Supabase 서버 키 (`sb_secret_...`). 마이페이지 API·keepalive | Production, Preview | 켜기 |
| `SESSION_SECRET` | 마이페이지 로그인 쿠키 서명 (32자 이상) | Production, Preview | 켜기 |
| `CRON_SECRET` | `/api/cron/keepalive` 호출 확인용. Vercel Cron 이 `Authorization: Bearer <값>`으로 자동 전송 | Production | 켜기 |

- 환경변수를 넣거나 바꾼 뒤에는 **Deployments → 최신 배포 → Redeploy** 해야 반영돼요.
- `SESSION_SECRET`을 바꾸면 로그인해 있던 고객은 다시 로그인해야 해요.
- 네이버 지도 Client ID는 `lib/studio-info.ts`에 들어 있어 따로 넣지 않아도 돼요.

## 2. vercel.json

- `regions: ["sin1"]`: 서버 함수를 싱가포르에서 실행 (Supabase DB 가 ap-southeast-1)
- `crons`: 매일 UTC 19:00 (한국시간 새벽 4시)에 `GET /api/cron/keepalive`
  - Supabase 무료 플랜이 오래 안 쓰여 일시 중지되는 것을 막는 안전장치
  - Hobby 플랜 Cron 은 정해진 시각에서 최대 1시간 안에 실행될 수 있어요

## 3. 배포 후 확인

1. Vercel → 프로젝트 → **Settings → Cron Jobs**에 `/api/cron/keepalive` (`0 19 * * *`)가 보이는지 확인
2. 같은 화면의 **Run** 버튼으로 한 번 실행 → **Logs**에서 상태 200 확인
3. 인증 없이 열면 401 이 나와야 정상:
   `https://blutiti-website.vercel.app/api/cron/keepalive` → `{"ok":false}`
4. 함수 리전: Deployments → 최신 배포 → **Functions** 탭(또는 Logs)에서 Region 이 `sin1`인지 확인
5. 마이페이지: `https://blutiti-website.vercel.app/mypage`에서 실제 예약으로 로그인
