/** GUIDE · 이용 방법 (기존 HOW IT WORKS) */
const STEPS: { title: string; desc: string; badge?: string }[] = [
  {
    title: "예약하고 편한 날 오세요",
    desc: "1시간 20분 동안 룸은 우리 팀만 써요. 무료 주차, 엘리베이터로 바로 연결돼요.",
  },
  { title: "리모콘 버튼만 누르세요", desc: "조명과 카메라는 세팅이 끝나 있어요. 컷 수 제한 없이 마음껏 찍으세요." },
  {
    title: "사진은 그날 도착해요",
    desc: "촬영한 원본 전체를 촬영 당일 오후 9시 이후 구글 드라이브 링크로 일괄 발송돼요. (웹사이즈 2048px)",
  },
  {
    title: "셀렉은 집에서 천천히",
    badge: "보정/인화 서비스 선택 시",
    desc: "보정·인화할 사진은 편한 시간에 골라주세요. 사진은 3개월 동안 보관해요.",
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
            <p className="t-kr">
              {s.title}
              {s.badge && (
                <>
                  {" "}
                  <span className="badge">{s.badge}</span>
                </>
              )}
            </p>
            <p className="muted cap">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
