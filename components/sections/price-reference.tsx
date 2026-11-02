import Link from "next/link";
import { formatKRW, priceLabel } from "@/lib/concepts";
import { BASIC_INCLUDES, FREE_BENEFITS, POST_ADD_ONS, PRE_ADD_ONS } from "@/lib/options";
import { BOOKING_HREF } from "@/lib/nav";
import { PRODUCTS } from "@/lib/products";

/**
 * 미사용: PRICE · 요금 안내 (레퍼런스 레이아웃)
 * 6단계에서 선택 순서를 따라가는 설명형(components/sections/price.tsx)으로 교체. 되돌릴 때를 위해 보관
 */
export function PriceReference() {
  return (
    <section id="price" className="alt band" aria-labelledby="price-h">
      <div className="wrap price-grid">
        <div>
          <div className="section-head">
            <p className="eyebrow">PRICE</p>
            <h2 id="price-h" className="h-kr">
              요금 안내
            </h2>
            <p className="muted cap" style={{ margin: 0 }}>
              1~2인 기준 요금이에요. 만 7세 이하 1명은 무료로 함께해요.
            </p>
          </div>
          <p className="sub-h">촬영 상품</p>
          <ul className="plist">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <span className="name">
                  {p.name}
                  {p.tag && <span className="tag">{p.tag}</span>}
                </span>
                <span className="price">
                  {p.price.listAmount && <s>{p.price.listAmount.toLocaleString("ko-KR")}</s>}
                  {priceLabel(p.price)}
                </span>
                <span className="desc">{p.desc}</span>
              </li>
            ))}
          </ul>
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
          <p className="sub-h">촬영 후 추가 (3개월 안에 주문 가능)</p>
          <ul className="plist small">
            {POST_ADD_ONS.map((o) => (
              <li key={o.name}>
                <span className="name">{o.name}</span>
                <span className="price">{o.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="sub-h">모든 촬영에 기본 제공</p>
          <ul className="basic">
            {BASIC_INCLUDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sub-h">무료 혜택</p>
          <ul className="plist small">
            {FREE_BENEFITS.map((b) => (
              <li key={b.name}>
                <span className="name">{b.name}</span>
                <span className="price">{b.benefit}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "var(--space-10)" }}>
            <Link className="btn btn-primary" href={BOOKING_HREF}>
              이 요금으로 예약하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
