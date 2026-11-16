import { KakaoChatButton } from "@/components/site/kakao";
import { ToTop } from "@/components/site/to-top";

/**
 * 오른쪽 아래 고정 버튼 묶음 (루트 레이아웃에 한 번 → 메인·모든 하위 페이지 공통)
 * 지금은 '맨 위로'(스크롤 후 나타남)만. 화면 아래 고정 바(bottom-bar.tsx) 바로 위에 뜸
 * 카카오톡 채널 채팅 원형 버튼은 하단 고정 바의 '카카오톡 문의하기'로 대체해 화면에서 뺌 (SHOW_KAKAO_FLOAT = true 면 다시 보임)
 * 예전: 위에서부터 '맨 위로' → 카카오톡 채널 채팅(항상 보임). 간격 12px, 가운데 정렬
 * - 카카오 버튼: 지름 52px, 카카오 노랑(디자인 시스템 코발트 규칙의 예외), 그림자 없이 --line 1px 테두리
 *   아이콘 = 카카오 개발자 공식 리소스에서 노란 원·말풍선만 쓴 public/brand/kakao-channel-chat.svg
 * - 주소 = lib/studio-info.ts STUDIO.kakaoChatUrl (새 탭. 모바일은 카카오톡 앱, PC 는 채팅 웹페이지)
 * - 모바일 메뉴가 열리면 둘 다 숨김 (header.tsx 가 <html data-menu-open> 설정, site.css)
 */
const SHOW_KAKAO_FLOAT = false;

export function FloatingActions() {
  return (
    <div className="float-stack">
      <ToTop />
      {SHOW_KAKAO_FLOAT && (
        <KakaoChatButton className="float-kakao" ariaLabel="카카오톡으로 문의하기">
          <img src="/brand/kakao-channel-chat.svg" alt="" width={52} height={52} />
        </KakaoChatButton>
      )}
    </div>
  );
}
