-- =====================================================================
-- 005: 보정본 확인 답변 종류 추가 (2026-11-20)
-- My Page 상세 '보정본 확인' 탭 (진행상태가 '보정본 확인'일 때만 보임)
--   approve  : 보정본 이상 없음 (완료 버튼)
--   revision : 보정본 수정 요청 (1회까지, 웹사이트 서버가 횟수 확인)
-- responses.type 허용 값에 두 가지를 더해요. 기존 답변·권한은 그대로예요.
-- Supabase SQL Editor 에 붙여넣어 실행. 여러 번 실행해도 결과는 같아요.
-- =====================================================================

begin;

alter table public.responses drop constraint if exists responses_type_check;
alter table public.responses
  add constraint responses_type_check
  check (type in ('select', 'order', 'inquiry', 'approve', 'revision'));

commit;

-- 확인용 (실행 후 approve, revision 이 들어 있으면 성공)
-- select pg_get_constraintdef(oid) from pg_constraint where conname = 'responses_type_check';
