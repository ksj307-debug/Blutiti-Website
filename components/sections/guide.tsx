import { Fragment, type ReactNode } from "react";
import { Sentences } from "@/components/site/sentences";

/**
 * GUIDE · 이용 방법 6단계 (기존 HOW IT WORKS)
 * - 제목 끝에는 마침표 없음. badge 는 설명 아래 조건 배지
 * - 레이아웃: 모바일 1열 / 태블릿 2열 x 3줄 / 데스크톱 3열 x 2줄 (site.css .steps)
 * 예전 5단계(01 원하는 날 예약하세요 ~ 05 원하는 대로 보정해드려요)는 01 '컨셉을 선택하세요'를 앞에 넣고 한 칸씩 밀림
 */
/** 05·06 조건 배지 */
const RETOUCH_BADGE = "패키지/보정/인화 서비스 선택 시";

type Step = {
  title: string;
  /** 설명 문자열 (문장마다 줄바꿈, \n 이 있으면 줄 단위) */
  desc?: string;
  /** 링크가 들어가는 설명: 한 줄씩 직접 지정 */
  lines?: ReactNode[];
  badge?: string;
};

const STEPS: Step[] = [
  {
    title: "컨셉을 선택하세요",
    lines: [
      "컬러, 흑백, 100일상, 시즌 등 다양한 컨셉이 준비되어 있어요.",
      <>
        자세한 내용은 아래{" "}
        <a className="text-link" href="#concepts">
          CONCEPTS
        </a>
        에서 확인해 주세요.
      </>,
    ],
  },
  {
    title: "원하는 촬영일을 선택하세요",
    desc: "1시간 20분 동안 룸은 우리 팀만 써요. 무료 주차, 엘리베이터로 바로 연결돼요.",
  },
  // '되어 있어요' 사이는 줄바꿈 안 되는 공백( ): '있어요'만 다음 줄로 밀리지 않게
  { title: "리모컨만 누르세요", desc: "조명과 카메라는 세팅이 되어 있어요. 컷 수 제한 없이 마음껏 찍으세요." },
  { title: "사진은 당일에 받아요", desc: "촬영 원본 파일 전체를 당일 오후 9시 이후 이메일로 링크를 보내드려요." },
  {
    title: "셀렉은 집에서 천천히",
    desc: "받은 원본 중 보정할 사진을 편하게 골라주세요. 선택한 사진의 파일명을 함께 보내드린 링크에 적어주세요.",
    badge: RETOUCH_BADGE,
  },
  {
    title: "원하는 대로 보정해 드려요",
    // 예외: '(수정 1회까지 가능)'은 앞 문장에 붙이지 않고 다음 줄로 → 줄 단위(\n)로 지정
    desc: "요청하신 부분을 그대로 반영해 보정해요.\n보정본을 최종 컨펌하시면 적어주신 주소로 액자와 함께 보내드려요.\n(수정 1회까지 가능)",
    badge: RETOUCH_BADGE,
  },
];

export function Guide() {
  return (
    <section id="guide" className="band wrap" aria-labelledby="guide-h">
      <div className="section-head">
        {/* 메뉴 이름은 lib/nav.ts 'GUIDE' 그대로 */}
        <p className="eyebrow">GUIDE (예약 안내)</p>
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
              {s.lines
                ? s.lines.map((line, j) => (
                    <Fragment key={j}>
                      {j > 0 && <br />}
                      <span className="sent">{line}</span>
                    </Fragment>
                  ))
                : s.desc && <Sentences text={s.desc} />}
            </p>
            {s.badge && <span className="badge step-badge">{s.badge}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
