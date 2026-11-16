import { Logo } from "@/components/site/logo";
import { Sentences } from "@/components/site/sentences";
import { INSTAGRAM_URL, KAKAO_CHAT_URL, KAKAO_LABEL, PHONE } from "@/lib/nav";

/** 사업자 정보 (푸터 맨 아래). 상호·대표·등록번호는 사장님이 준 값 */
const BUSINESS = {
  name: "블루티티 셀프스튜디오",
  owner: "김승준",
  regNo: "861-26-01888",
  address: "경기 안산시 단원구 화랑로 130, 2동 2층 207호",
} as const;

export function Footer() {
  return (
    <>
      <footer>
        <div className="wrap foot">
          <div style={{ display: "grid", gap: "var(--space-4)", alignContent: "start" }}>
            <Logo shape="horizontal" tone="ivory" className="logo-foot" />
            <p>
              <Sentences text="세팅은 끝났어요. 버튼만 누르고 웃어주세요." />
            </p>
            {/* 예전 'Our Story' 링크(/our-story): 2026-11 페이지 삭제로 뺌 */}
          </div>
          <div id="contact">
            <p className="eyebrow">CONTACT</p>
            <p>
              {/* 예전: 채널 홈(KAKAO_URL). 문의 링크는 모두 채널 채팅으로 통일 */}
              <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener">
                {KAKAO_LABEL}
              </a>
              <br />
              인스타그램{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
                @blutiti_studio
              </a>
              <br />
              {PHONE}
            </p>
          </div>
          <div>
            <p className="eyebrow">STUDIO</p>
            <p>
              경기 안산시 단원구 화랑로 130
              <br />
              2동 2층 207호 · 매일 10:00~21:50
              {/* 예전 3번째 줄: 사업자 정보는 오픈 시 표시 → 아래 사업자 정보 줄로 옮김 */}
            </p>
          </div>
        </div>
        {/* 사업자 정보 · 저작권 (가운데 정렬, 구분선 위) */}
        <div className="wrap foot-biz">
          <p>
            <span>{BUSINESS.name}</span>
            <span>대표 {BUSINESS.owner}</span>
            <span className="num">Business Registration : {BUSINESS.regNo}</span>
          </p>
          <p>
            <span>주소: {BUSINESS.address}</span>
            <span className="num">대표전화: {PHONE}</span>
          </p>
          <p className="foot-copy">
            Copyright ⓒ <span className="foot-brand">BLUTITI SELFIE STUDIO</span> All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* 하단 고정 바(카카오톡 문의·예약하기)는 뺌. components/site/mobile-bar.tsx 는 보관 */}
    </>
  );
}
