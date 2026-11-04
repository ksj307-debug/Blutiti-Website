import { CopyButton } from "@/components/site/copy-button";
import { Sentences } from "@/components/site/sentences";
import { NAVER_URL } from "@/lib/reviews";
import { PHONE } from "@/lib/nav";

/** FAQ · 자주 묻는 질문 (기존 GUIDE 이용 안내) + LOCATION · 오시는 길 (기존 VISIT) */
const FAQ = [
  {
    q: "몇 명까지 함께 찍을 수 있나요?",
    a: "요금은 1~2인 기준이고 만 7세 이하 1명은 무료예요. 그 이상은 1인당 15,000원의 인원 추가를 선택해 주세요. 예를 들어 어른 3명과 미취학 아동 3명이면 인원 추가 3명이 필요해요.",
  },
  { q: "반려견과 함께 가도 되나요?", a: "가능 여부를 먼저 확인해 드려요. 방문 전에 카카오톡 채널 '블루티티'로 문의해 주세요." },
  {
    q: "예약을 바꾸거나 취소할 수 있나요?",
    a: "촬영일 3일 전까지 가능해요. 2일 이내 예약은 변경·취소가 어렵고, 부득이한 경우 일정 변경만 1회 가능해요.",
  },
  { q: "늦게 도착하면 어떻게 되나요?", a: "다음 팀 예약이 있어 퇴실은 정시 기준으로 진행돼요. 여유 있게 와주세요." },
  {
    q: "사진은 언제, 어떻게 받나요?",
    a: "촬영한 원본 전체를 촬영 당일 오후 9시 이후 구글 드라이브 링크로 보내드려요. (웹사이즈 2048px) 사진은 촬영일 기준 3개월 동안 보관 후 삭제되니 그 안에 내려받아 주세요.",
  },
  {
    q: "보정·인화할 사진은 어떻게 고르나요?",
    a: "예약 조회 화면의 셀렉 버튼으로 집에서 천천히 골라주세요. 보정·인화본은 종이액자와 함께 우편으로 보내드려요.",
  },
  { q: "주차할 수 있나요?", a: "지하 주차장을 무료로 이용하실 수 있고, 엘리베이터로 스튜디오까지 바로 연결돼요." },
];

const ADDRESS = "경기 안산시 단원구 화랑로 130 2동 2층 207호";

export function FaqLocation() {
  return (
    <section className="band wrap two" aria-label="자주 묻는 질문과 오시는 길">
      <div id="faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2 className="h-kr">자주 묻는 질문</h2>
        </div>
        {FAQ.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>
              <span className="index">{String(i + 1).padStart(2, "0")}</span>
              <span className="t-kr">{item.q}</span>
            </summary>
            <p className="ans">
              <Sentences text={item.a} />
            </p>
          </details>
        ))}
      </div>
      <div id="location" className="visit">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <p className="eyebrow">LOCATION</p>
          <h2 className="h-kr">오시는 길</h2>
        </div>
        <div className="mapcard">
          <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g fill="none" stroke="var(--stone)" strokeWidth="10">
              <path d="M-20 170 L420 120" />
              <path d="M150 -20 L190 270" />
            </g>
            <g fill="none" stroke="var(--line)" strokeWidth="4">
              <path d="M-20 60 L420 30" />
              <path d="M60 -20 L90 270" />
              <path d="M300 -20 L330 270" />
              <path d="M-20 230 L420 200" />
            </g>
            <circle cx="250" cy="98" r="9" fill="var(--titi-navy)" />
            <circle cx="250" cy="98" r="18" fill="none" stroke="var(--titi-navy)" strokeWidth="1" />
          </svg>
          <div className="pin">
            <b>블루티티 셀프스튜디오</b>
            <span className="cap muted">초지역 2번 출구에서 697m</span>
          </div>
        </div>
        <dl className="kv">
          <dt>주소</dt>
          <dd>
            <span className="copyrow">
              <span>{ADDRESS}</span>
              <CopyButton text={ADDRESS} />
            </span>
            <span className="cap muted">초지역메이저타운 푸르지오 에코단지 상가 2동</span>
          </dd>
          <dt>지하철</dt>
          <dd>4호선·수인분당선·서해선 초지역 2번 출구</dd>
          <dt>주차</dt>
          <dd>지하 주차장 무료, 엘리베이터 연결</dd>
          <dt>영업</dt>
          <dd className="num">매일 10:00~21:50</dd>
          <dt>전화</dt>
          <dd>
            <span className="copyrow">
              <span className="num">{PHONE}</span>
              <CopyButton text={PHONE} />
            </span>
          </dd>
        </dl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <a className="btn" href={NAVER_URL} target="_blank" rel="noopener">
            네이버 지도에서 보기
          </a>
          <a className="btn" href={NAVER_URL} target="_blank" rel="noopener">
            네이버 예약
          </a>
        </div>
      </div>
    </section>
  );
}
