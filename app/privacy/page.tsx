import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { KAKAO_CHAT_URL, KAKAO_LABEL, PHONE } from "@/lib/nav";
import { BUSINESS } from "@/lib/studio-info";
import { PHOTO_KEEP_DAYS } from "@/lib/mypage-config";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 블루티티 셀프스튜디오",
  description: "블루티티 셀프스튜디오가 예약·사진 전달·My Page 이용 과정에서 개인정보를 어떻게 처리하는지 안내해요.",
  alternates: { canonical: "/privacy" },
};

/** 시행일 (내용을 바꾸면 날짜도 바꾸고, 이전 방침은 아래 '변경 이력'에 남기기) */
const EFFECTIVE_DATE = "2026년 11월 28일";
/** 변경 이력 (최신이 위) */
const HISTORY = [
  "2026년 11월 28일: My Page 로그인 확인 정보를 이름에서 이메일로 변경, 우편 발송 주소·요청 문구 항목 명시",
  "2026년 11월 23일: 웹사이트 방문 통계(구글 애널리틱스) 수집 추가",
  "2026년 11월 17일: 최초 시행",
];

/**
 * 개인정보처리방침 (/privacy) — 푸터 맨 아래 링크
 * 실제 처리 흐름 기준으로 작성 (2026-11):
 *  - 네이버 예약·카카오 예약 → 구글 시트 '블루티티 예약관리_자동화' → Supabase(bookings) 자동 동기화 (apps-script/)
 *  - My Page: 이름 + 휴대폰 뒷 4자리로 로그인, 셀렉·추가 주문 답변 저장 (responses), 로그인 실패 기록은 IP 해시로 1일 (login_attempts)
 *  - 사진 파일: 구글 드라이브 링크로 전달, 이용일 기준 PHOTO_KEEP_DAYS(30)일 보관
 *  - 예약·주문 정보: 전자상거래법 기준 5년 (사장님 결정)
 *  - 서버: Vercel(sin1 싱가포르) · Supabase(ap-southeast-1 싱가포르)
 */
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="band policy-page" aria-labelledby="privacy-h">
          <div className="wrap policy-wrap">
            <div className="section-head">
              <p className="eyebrow">PRIVACY POLICY</p>
              <h1 id="privacy-h" className="h-kr">
                개인정보처리방침
              </h1>
              <p className="muted">
                {BUSINESS.name}(이하 &lsquo;블루티티&rsquo;)는 「개인정보 보호법」에 따라 고객의 개인정보를 보호하고, 관련 고민을 빠르게
                해결할 수 있도록 다음과 같이 개인정보처리방침을 두고 있어요.
              </p>
              <p className="cap muted">시행일: {EFFECTIVE_DATE}</p>
            </div>

            <ol className="policy-toc" aria-label="목차">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>
                    <span className="index num">{String(i + 1).padStart(2, "0")}</span> {t.title}
                  </a>
                </li>
              ))}
            </ol>

            <article className="privacy-doc">
              <h2 id="p-purpose">1. 개인정보를 처리하는 목적</h2>
              <p>블루티티는 아래 목적에만 개인정보를 처리하고, 목적이 바뀌면 미리 동의를 받아요.</p>
              <ul>
                <li>촬영 예약 확인과 이용 안내, 예약 변경·취소 처리</li>
                <li>촬영 사진 파일 전달과 사진 확인 요청 메일 발송</li>
                <li>My Page 로그인(본인 확인), 진행 상태 안내, 셀렉(보정·인화할 사진 선택)과 추가 주문 접수</li>
                <li>보정·인화본 우편 발송, 지하 주차장 차량 등록</li>
                <li>문의 응대, 분쟁 해결, 관련 법령에 따른 기록 보관</li>
              </ul>

              <h2 id="p-items">2. 처리하는 개인정보 항목과 수집 방법</h2>
              <div className="policy-table" role="region" aria-label="처리 항목" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">구분</th>
                      <th scope="col">항목</th>
                      <th scope="col">수집 방법</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">예약</th>
                      <td>
                        예약자 이름(예약 채널에서 받는 경우), 휴대폰 번호, 이메일, 촬영 파일을 받을 이메일, 예약 상품·옵션, 이용 일시, 신청
                        일시, 결제 상태·금액, 주차 차량번호, 보정·인화본 우편 발송 주소, 레터링 등 요청 문구
                      </td>
                      <td>네이버 예약·카카오 예약에서 고객이 입력한 정보를 예약 관리용으로 전달받아요.</td>
                    </tr>
                    <tr>
                      <th scope="row">사진 전달</th>
                      <td>촬영 사진 파일, 사진 다운로드 링크, 진행 상태</td>
                      <td>촬영 후 블루티티가 등록해요.</td>
                    </tr>
                    <tr>
                      <th scope="row">My Page</th>
                      <td>
                        로그인할 때 입력한 이메일과 휴대폰 번호 뒷 4자리(예약 정보와 맞춰 보는 데만 쓰고 따로 저장하지 않아요), 셀렉한 사진
                        파일명과 보정 요청, 촬영 후 추가 구매 항목과 요청 사항, 보정본 확인 완료·수정 요청
                      </td>
                      <td>고객이 My Page에서 직접 입력해요.</td>
                    </tr>
                    <tr>
                      <th scope="row">자동 생성</th>
                      <td>
                        로그인 유지 쿠키(예약번호만 담음), 로그인 실패 기록(접속 IP를 알아볼 수 없게 변환한 값), 웹사이트 접속 기록(IP
                        주소, 접속 일시, 브라우저 정보), 방문 통계(본 페이지, 머문 시간, 누른 버튼, 들어온 경로, 기기·브라우저 종류, 대략적인
                        지역, 방문 통계 쿠키 식별값). 방문 통계는 My Page 화면에서는 수집하지 않아요.
                      </td>
                      <td>웹사이트를 이용할 때 자동으로 생성돼요.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="cap muted">블루티티 웹사이트는 회원가입을 받지 않고, 결제는 네이버 예약·카카오 예약과 계좌이체로만 이뤄져요.</p>

              <h2 id="p-period">3. 보유 기간과 파기</h2>
              <div className="policy-table" role="region" aria-label="보유 기간" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">항목</th>
                      <th scope="col">보유 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">촬영 사진 파일·다운로드 링크</th>
                      <td>이용일로부터 {PHOTO_KEEP_DAYS}일. 기간이 지나면 다운로드 링크를 닫고 파일을 삭제해요.</td>
                    </tr>
                    <tr>
                      <th scope="row">예약 정보, 셀렉·추가 주문 내용</th>
                      <td>
                        이용일로부터 5년 (「전자상거래 등에서의 소비자보호에 관한 법률」: 계약·청약철회 기록, 대금 결제·재화 공급 기록
                        5년, 소비자 불만·분쟁 처리 기록 3년)
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">로그인 유지 쿠키</th>
                      <td>2시간 (로그아웃하면 바로 삭제)</td>
                    </tr>
                    <tr>
                      <th scope="row">로그인 실패 기록</th>
                      <td>1일</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                보유 기간이 끝나거나 처리 목적을 이루면 지체 없이 파기해요. 전자 파일은 다시 살릴 수 없는 방법으로 지우고, 종이 문서는
                분쇄하거나 태워요.
              </p>

              <h2 id="p-third">4. 개인정보의 제3자 제공</h2>
              <p>블루티티는 고객의 개인정보를 제3자에게 제공하지 않아요. 다만 고객이 동의하거나 법령에 특별한 규정이 있는 경우는 예외예요.</p>

              <h2 id="p-outsourcing">5. 처리 위탁과 국외 이전</h2>
              <p>원활한 서비스를 위해 아래 업체에 개인정보 처리 업무를 맡기고 있어요. 계약으로 안전하게 관리하도록 하고 있어요.</p>
              <div className="policy-table" role="region" aria-label="처리 위탁" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">수탁 업체</th>
                      <th scope="col">맡기는 업무</th>
                      <th scope="col">보관 국가</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Supabase Inc.</th>
                      <td>예약 정보와 My Page 입력 내용 보관(데이터베이스)</td>
                      <td>싱가포르</td>
                    </tr>
                    <tr>
                      <th scope="row">Vercel Inc.</th>
                      <td>웹사이트 운영(호스팅), My Page 처리</td>
                      <td>싱가포르 (화면 전송은 각 지역 서버)</td>
                    </tr>
                    <tr>
                      <th scope="row">Google LLC</th>
                      <td>예약 관리(구글 시트), 사진 파일 보관·전달(구글 드라이브), 메일 발송, 웹사이트 방문 통계(구글 애널리틱스)</td>
                      <td>미국 등 Google 데이터센터</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                국외로 옮겨지는 항목은 위 2번의 항목이며, 서비스를 이용할 때 네트워크로 전송돼요. 보유 기간은 위 3번과 같아요. 국외 이전을
                원하지 않으시면 아래 연락처로 알려 주세요. 다만 이 경우 My Page와 온라인 사진 전달을 이용하기 어려울 수 있어요.
              </p>

              <h2 id="p-rights">6. 고객의 권리와 행사 방법</h2>
              <p>
                고객은 언제든 자신의 개인정보를 열람하거나 정정·삭제·처리 정지를 요청할 수 있어요. 아래 연락처로 요청하시면 본인 확인 후
                지체 없이 처리해요. 법령에서 보관하도록 정한 정보는 그 기간 동안 삭제가 어려울 수 있어요.
              </p>

              <h2 id="p-safety">7. 개인정보를 안전하게 지키는 방법</h2>
              <ul>
                <li>모든 접속은 암호화(HTTPS)해서 주고받아요.</li>
                <li>데이터베이스는 서버에서만 접근하고, 접근 권한을 대표자로 제한해요.</li>
                <li>My Page 로그인 쿠키는 위조할 수 없게 서명하고, 브라우저 스크립트가 읽을 수 없게 해요.</li>
                <li>로그인 실패가 반복되면 잠시 시도를 막아 무작위 대입을 차단해요.</li>
                <li>My Page 화면에는 전화번호·이메일·결제 금액·차량번호를 보여주지 않아요.</li>
              </ul>

              <h2 id="p-cookie">8. 쿠키 사용</h2>
              <p>
                블루티티는 두 가지 목적으로 쿠키를 써요. 광고 목적의 쿠키는 쓰지 않아요.
              </p>
              <ul>
                <li>My Page 로그인 유지 (2시간, 로그아웃하면 바로 삭제)</li>
                <li>
                  웹사이트 방문 통계: 구글 애널리틱스로 어떤 페이지를 얼마나 보는지, 어떤 경로로 들어오는지를 이름·연락처 없이 통계로만 봐요.
                  통계 데이터는 구글 애널리틱스에 최대 14개월 보관돼요. My Page 화면에서는 수집하지 않아요.
                </li>
              </ul>
              <p>
                브라우저 설정에서 쿠키를 막을 수 있어요. 다만 그러면 My Page 로그인이 유지되지 않아요. 방문 통계만 거부하시려면{" "}
                <a className="text-link" href="https://tools.google.com/dlpage/gaoptout?hl=ko" target="_blank" rel="noopener">
                  구글 애널리틱스 차단 부가기능
                </a>
                을 설치하시면 돼요. 지도(네이버 지도)와 카카오톡 채널 버튼은 각 회사의 개인정보처리방침을 따라요.
              </p>

              <h2 id="p-officer">9. 개인정보 보호책임자</h2>
              <dl className="kv policy-kv">
                <dt>책임자</dt>
                <dd>{BUSINESS.owner} (대표)</dd>
                <dt>전화</dt>
                <dd className="num">{PHONE}</dd>
                <dt>카카오톡</dt>
                <dd>
                  <a className="text-link" href={KAKAO_CHAT_URL} target="_blank" rel="noopener">
                    {KAKAO_LABEL}
                  </a>
                </dd>
              </dl>

              <h2 id="p-remedy">10. 권익 침해 구제 방법</h2>
              <p>개인정보 침해로 도움이 필요하시면 아래 기관에 상담하거나 신고할 수 있어요.</p>
              <ul>
                <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: 1301 (www.spo.go.kr)</li>
                <li>경찰청: 182 (ecrm.police.go.kr)</li>
              </ul>

              <h2 id="p-change">11. 처리방침 변경</h2>
              <p>
                이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용돼요. 내용이 바뀌면 시행 7일 전부터 이 페이지에 알려 드려요.
              </p>
              <ul className="cap muted">
                {HISTORY.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="cap muted">
                {BUSINESS.name} · 대표 {BUSINESS.owner} · 사업자등록번호 {BUSINESS.regNo} · {BUSINESS.address}
              </p>
            </article>

            <p>
              <Link className="link" href="/">
                ← 홈으로
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const TOC = [
  { id: "p-purpose", title: "개인정보를 처리하는 목적" },
  { id: "p-items", title: "처리하는 항목과 수집 방법" },
  { id: "p-period", title: "보유 기간과 파기" },
  { id: "p-third", title: "제3자 제공" },
  { id: "p-outsourcing", title: "처리 위탁과 국외 이전" },
  { id: "p-rights", title: "고객의 권리와 행사 방법" },
  { id: "p-safety", title: "안전하게 지키는 방법" },
  { id: "p-cookie", title: "쿠키 사용" },
  { id: "p-officer", title: "개인정보 보호책임자" },
  { id: "p-remedy", title: "권익 침해 구제 방법" },
  { id: "p-change", title: "처리방침 변경" },
];
