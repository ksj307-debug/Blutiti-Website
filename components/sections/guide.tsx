import { Sentences } from "@/components/site/sentences";

/**
 * GUIDE · 이용 방법 5단계 (기존 HOW IT WORKS)
 * 제목 끝에는 마침표 없음. badge 는 설명 아래 조건 배지
 */
const STEPS: { title: string; desc: string; badge?: string }[] = [
  {
    title: "원하는 날 예약하세요",
    desc: "1시간 20분 동안 룸은 우리 팀만 써요. 무료 주차, 엘리베이터로 바로 연결돼요.",
  },
  { title: "리모컨만 누르세요", desc: "조명과 카메라는 세팅이 되어 있어요. 컷 수 제한 없이 마음껏 찍으세요." },
  { title: "사진은 당일에 받아요", desc: "촬영 원본 파일 전체를 당일 오후 9시 이후에 링크로 보내드려요." },
  {
    title: "셀렉은 집에서 천천히",
    desc: "받은 원본 중 보정할 사진을 편하게 골라주세요. 선택한 사진의 파일명을 전달된 구글폼에 적어주세요.",
    badge: "패키지/보정/인화 서비스 선택 시",
  },
  {
    title: "원하는 대로 보정해드려요",
    desc: "요청하신 부분을 그대로 반영해 보정해요. 보정본 확인 후 최종 컨펌 메일을 회신해 주세요. (수정 1회까지 가능)",
  },
];

export function Guide() {
  return (
    <section id="guide" className="wrap" aria-labelledby="guide-h">
      <div className="section-head">
        <p className="eyebrow">GUIDE</p>
        <h2 id="guide-h" className="h-kr">
          버튼만 누르면 끝나는 촬영
        </h2>
      </div>
      <div className="steps">
        {STEPS.map((s, i) => (
          <div className="step" key={s.title}>
            <span className="big">{String(i + 1).padStart(2, "0")}</span>
            <p className="t-kr">{s.title}</p>
            <p className="muted cap">
              <Sentences text={s.desc} />
            </p>
            {s.badge && <span className="badge step-badge">{s.badge}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
