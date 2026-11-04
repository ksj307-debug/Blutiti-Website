import { CONCEPTS, PLANS, formatKRW, priceLabel, type PlanPrice } from "@/lib/concepts";
import { BASIC_INCLUDES, FREE_BENEFITS, POST_ADD_ONS, PRE_ADD_ONS } from "@/lib/options";
import { Sentences } from "@/components/site/sentences";

/**
 * PRICE · 요금 안내 — 예약 순서(컨셉 → 가성비/패키지 → 부가서비스)를 따라가는 설명형
 * 금액은 lib/concepts.ts(컨셉×플랜), lib/options.ts(부가서비스·혜택)에서만 가져옴
 * 02 필수 선택 카드는 금액 없이 구성만 (금액은 01 컨셉 표)
 */

/** 표 한 줄 = 세부 상품 (증명·프로필은 증명·여권 / 프로필 2줄) */
const ROWS = CONCEPTS.flatMap((c) =>
  c.variants.map((v) => ({
    key: v.id,
    name: c.variants.length > 1 ? v.name : c.name,
    note: v.note ?? c.themes?.join(" · "),
    plans: v.plans,
  })),
);

function Amount({ price }: { price: PlanPrice }) {
  return (
    <>
      {price.listAmount && (
        <s className="list">
          <span className="sr">정가 </span>
          {formatKRW(price.listAmount)}
        </s>
      )}
      <span className={price.amount === null ? "ask" : undefined}>{priceLabel(price)}</span>
    </>
  );
}

/** 요금제 카드 목록 아이콘 (1px 선) */
const CheckIcon = () => (
  <svg className="plan-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = () => (
  <svg className="plan-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="추가">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function StepHead({ no, title, lead }: { no: string; title: string; lead?: string }) {
  return (
    <div className="pstep-h">
      <span className="index">{no}</span>
      <h3 className="t-title-kr">{title}</h3>
      {lead && (
        <p className="muted">
          <Sentences text={lead} />
        </p>
      )}
    </div>
  );
}

export function Price() {
  return (
    <section id="price" className="alt band" aria-labelledby="price-h">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">PRICE</p>
          <h2 id="price-h" className="h-kr">
            요금 안내
          </h2>
          <p className="muted cap" style={{ margin: 0 }}>
            <Sentences text="1~2인 기준 요금이에요. 만 7세 이하 1명은 무료로 함께해요." />
          </p>
        </div>

        {/* 1. 컨셉 선택 */}
        <div className="pstep">
          <StepHead no="01" title="컨셉 선택" lead="가격은 컨셉별로 달라요." />
          <table className="ptable">
            <caption className="sr">컨셉별 가성비·패키지 요금</caption>
            <thead>
              <tr>
                <th scope="col">컨셉</th>
                {PLANS.map((p) => (
                  <th scope="col" key={p.id}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key}>
                  <th scope="row">
                    <span className="name">{r.name}</span>
                    {r.note && <span className="t-caption muted">{r.note}</span>}
                  </th>
                  {PLANS.map((p) => (
                    <td key={p.id} data-label={p.name}>
                      <Amount price={r.plans[p.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <a className="btn-secondary pstep-more" href="#concepts">
            컨셉 자세히 보기
          </a>
        </div>

        {/* 2. 필수 선택: 가성비 / 패키지 */}
        <div className="pstep">
          <StepHead
            no="02"
            title="필수 선택"
            lead="컨셉을 고른 뒤 가성비와 패키지 중 하나를 선택하세요. 모든 컨셉에 똑같이 적용돼요."
          />
          {/* SaaS 요금제처럼 구성만 비교 (금액은 01 표). 패키지 = 가성비 구성 전부 + 추가 항목 */}
          {/* 예약 버튼 없음: 따라다니는 헤더·하단 바 '예약하기'로 이동 */}
          <div className="plans">
            {PLANS.map((p, i) => {
              const featured = !!p.badge;
              const prev = PLANS[i - 1];
              const extras = prev ? p.includes.filter((item) => !prev.includes.includes(item)) : p.includes;
              return (
                <article key={p.id} className={`plan${featured ? " plan-featured" : ""}`}>
                  <div className="plan-h">
                    <h4 className="t-title-kr">{p.name}</h4>
                    {p.badge && <span className="badge">{p.badge}</span>}
                  </div>
                  <p className="muted">
                    <Sentences text={p.summary} />
                  </p>
                  <ul className="plan-list">
                    {prev && (
                      <li className="plan-all">
                        <CheckIcon />
                        <span>{prev.name} 구성 모두 포함</span>
                      </li>
                    )}
                    {extras.map((item) => (
                      <li key={item}>
                        {prev ? <PlusIcon /> : <CheckIcon />}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        {/* 3. 부가서비스 선택 */}
        <div className="pstep">
          <StepHead no="03" title="부가서비스 선택" lead="필요한 서비스만 추가로 선택하세요." />
          <div className="addons">
            <div>
              <p className="sub-h">촬영 전 추가</p>
              <ul className="plist small">
                {PRE_ADD_ONS.map((o) => (
                  <li key={o.id}>
                    <span className="name">{o.name}</span>
                    <span className="price">{formatKRW(o.price)}</span>
                    {o.desc && <span className="desc">{o.desc}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="sub-h addon-after">
                <span className="badge">촬영 후 추가도 가능</span>
                <span className="t-caption muted">3개월 안에 주문할 수 있어요</span>
              </p>
              <ul className="plist small">
                {POST_ADD_ONS.map((o) => (
                  <li key={o.name}>
                    <span className="name">{o.name}</span>
                    <span className="price">{o.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. 이벤트 · 기본 제공 */}
        <div className="pstep">
          <StepHead no="04" title="이벤트 · 기본 제공" />
          <div className="addons">
            <div>
              <p className="sub-h">지금 제공되는 이벤트 놓치지 마세요</p>
              <ul className="plist small">
                {FREE_BENEFITS.map((b) => (
                  <li key={b.name}>
                    <span className="name">{b.name}</span>
                    <span className="price">{b.benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="sub-h">모든 촬영에 기본 제공</p>
              <ul className="plist small">
                {BASIC_INCLUDES.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                    <span className="badge">기본 제공</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
