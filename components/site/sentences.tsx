import { Fragment } from "react";

/**
 * 본문 문장 줄바꿈: 원본 문자열은 그대로 두고, 화면에 그릴 때만 문장마다 줄을 바꿈
 * - 나누는 곳: 마침표·물음표·느낌표 바로 뒤가 공백이거나 문장 끝일 때만
 *   (소수점 2.5, 시간 10:00, 규격 4x6 은 뒤가 공백이 아니라 그대로)
 * - 괄호 안의 마침표에서는 나누지 않음
 * - 마침표 바로 뒤의 괄호 보충 설명은 앞 문장에 붙임: '회신해 주세요. (수정 1회까지 가능)' → 한 줄
 * - 문장 사이에는 문단 간격 없이 줄만 바꿈, 긴 문장은 단어 단위로 줄넘김 (.sent → word-break: keep-all)
 */
const END = ".?!";
const OPEN = "([（［";
const CLOSE = ")]）］";
/** 문장 끝 부호 뒤에 붙어 있는 닫는 따옴표 */
const TRAIL = "\"'”’」』";

export function splitSentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  let depth = 0;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (OPEN.includes(ch)) depth++;
    else if (CLOSE.includes(ch)) depth = Math.max(0, depth - 1);
    else if (depth === 0 && END.includes(ch)) {
      let end = i + 1;
      while (end < text.length && (END.includes(text[end]) || TRAIL.includes(text[end]))) end++;
      if (end === text.length || /\s/.test(text[end])) {
        // 바로 뒤 괄호 보충 설명은 앞 문장에 포함
        let next = end;
        while (next < text.length && /\s/.test(text[next])) next++;
        if (OPEN.includes(text[next])) {
          let d = 0;
          let j = next;
          for (; j < text.length; j++) {
            if (OPEN.includes(text[j])) d++;
            else if (CLOSE.includes(text[j]) && --d === 0) break;
          }
          if (j < text.length) end = j + 1;
        }
        const sentence = text.slice(start, end).trim();
        if (sentence) out.push(sentence);
        start = end;
        i = end;
        continue;
      }
      i = end;
      continue;
    }
    i++;
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

/**
 * <p> 등 본문 요소 안에 넣어 사용: <p className="muted"><Sentences text={...} /></p>
 * 문자열에 줄바꿈(\n)이 있으면 마침표 기준 대신 그 줄 단위로 나눔 (마침표 없는 줄이 있을 때)
 */
export function Sentences({ text }: { text: string }) {
  const lines = text.includes("\n")
    ? text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : splitSentences(text);
  return (
    <>
      {lines.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <span className="sent">{s}</span>
        </Fragment>
      ))}
    </>
  );
}
