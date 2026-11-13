import { Fragment } from "react";
import { CONCEPTS, PLANS, formatKRW, isAvailable, priceLabel, type PlanPrice } from "@/lib/concepts";
import { BASIC_INCLUDES, FREE_BENEFITS, POST_ADD_ONS, PRE_ADD_ONS } from "@/lib/options";
import { Sentences } from "@/components/site/sentences";
import { MoreList } from "@/components/site/more-list";
import { PlanBookLink } from "@/components/site/plan-book-link";

/**
 * PRICE · 요금 안내 — 예약 순서(컨셉 → 가성비/패키지 → 부가서비스)를 따라가는 설명형
 * 금액은 lib/concepts.ts(컨셉×플랜), lib/options.ts(부가서비스·혜택)에서만 가져옴
 * 02 필수 선택 카드는 금액 없이 구성만 (금액은 01 컨셉 표). 가성비 카드에 '모든 촬영에 기본 제공' 목록 포함
 */

/** 표 한 줄 = 세부 상품 (증명·프로필은 증명·여권 / 프로필 2줄) */
const ROWS = CONCEPTS.flatMap((c) =>
  c.variants.map((v) => ({
    key: v.id,
    name: c.variants.length > 1 ? v.name : c.bookingName,
    // 컨셉명 아래 주석(note)은 화면에서 뺌. 데이터 v.note 는 그대로
    plans: v.plans,
  })),
);

/** 표 금액 칸: 판매 안 함 '–' / 문의 / 금액 (정가 취소선은 위에 작게) */
function Amount({ price }: { price: PlanPrice }) {
  if (!isAvailable(price))
    return (
      <span className="na">
        –<span className="sr">판매하지 않음</span>
      </span>
    );
  return (
    <span className="amt">
      {price.listAmount && (
        <s className="list">
          <span className="sr">정가 </span>
          {formatKRW(price.listAmount)}
        </s>
      )}
      <span className={price.amount === null ? "ask" : undefined}>{priceLabel(price)}</span>
    </span>
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

        {/* 1. 컨셉 선택: 행 = 컨셉, 열 = 가성비 | 패키지. 모바일에서도 표 그대로 (정가는 할인가 위에 작게) */}
        <div className="pstep">
          <StepHead no="01" title="컨셉 선택" lead="가격은 컨셉별로 달라요." />
          <table className="ptable">
            <caption className="sr">컨셉별 가성비·패키지 요금</caption>
            <thead>
              <tr>
                <th scope="col">컨셉</th>
                {PLANS.map((p) => (
                  <th scope="col" key={p.id} className="col-price">
                    {p.name}
                    {p.badge && <span className="badge">{p.badge}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key}>
                  <th scope="row">
                    <span className="name">{r.name}</span>
                  </th>
                  {PLANS.map((p) => (
                    <td key={p.id} className="col-price">
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

        {/* 2. 필수 선택: SaaS 요금제 카드 (금액은 01 표). 패키지 = 가성비 구성 전부 + 추가 항목 */}
        <div className="pstep">
          <StepHead
            no="02"
            title="필수 선택"
            lead="컨셉을 고른 뒤 가성비와 패키지 중 하나를 선택하세요. 모든 컨셉에 똑같이 적용돼요."
          />
          {/* 모든 화면에서 왼쪽 가성비 · 오른쪽 패키지. 버튼은 그 플랜으로 BOOKING
              카드에는 가격을 넣지 않음: 컨셉마다 가격이 달라 헷갈릴 수 있어서 (가격은 01 표). 예전: 베이직 컬러 기준 고정가 표시 */}
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
                  {prev ? (
                    <ul className="plan-list">
                      <li className="plan-all">
                        <CheckIcon />
                        <span>{prev.name} 구성 모두 포함</span>
                      </li>
                      {extras.map((item) => (
                        <li key={item}>
                          <PlusIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // 가성비: 원본 무제한 + '모든 촬영에 기본 제공' 전체. 모바일은 처음 3줄만, 펼쳐 보기
                    <MoreList
                      className="plan-list"
                      visible={3}
                      moreLabel="전체 보기"
                      items={[...p.includes, ...BASIC_INCLUDES].map((item) => (
                        <Fragment key={item}>
                          <CheckIcon />
                          <span>{item}</span>
                        </Fragment>
                      ))}
                    />
                  )}
                  <PlanBookLink plan={p.id} className={`${featured ? "btn-primary" : "btn-secondary"} plan-book`}>
                    {p.name}로 예약하기
                  </PlanBookLink>
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

        {/* 4. 이벤트 ('모든 촬영에 기본 제공' 목록은 02 가성비 카드로 옮김. 예전 제목: 이벤트 · 기본 제공) */}
        <div className="pstep">
          <StepHead no="04" title="이벤트" />
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
          </div>
        </div>
      </div>
    </section>
  );
}
