/**
 * 블루티티 예약 시트 → Supabase bookings 자동 동기화 (Google Apps Script)
 *
 * 붙여넣는 곳: 구글 시트 "블루티티 예약관리_자동화" > 확장 프로그램 > Apps Script
 * 설치 순서: 같은 폴더 README.md
 *
 * 함수
 *   syncBookings()  예약번호가 있는 모든 행을 bookings 에 upsert (100건씩). 15분 트리거·메뉴에서 실행
 *   setup()         처음 한 번 실행: 15분 트리거, N1·O1 헤더, O열 진행상태 드롭다운
 *   onOpen()        시트 위 메뉴 '블루티티 > 지금 동기화'
 *
 * 접속 정보는 코드에 쓰지 않음 → 프로젝트 설정 > 스크립트 속성
 *   SUPABASE_URL         예) https://xxxx.supabase.co
 *   SUPABASE_SECRET_KEY  sb_secret_... (새 secret 키) 또는 eyJ... (예전 service_role 키)
 *
 * 로그에는 '전송 N건, 실패 N건'과 예약번호만 남김 (이름·전화번호·이메일은 남기지 않음)
 */

/** 데이터가 있는 탭 이름 (1행 = 헤더) */
var SHEET_TAB = 'Sheet1';
/** upsert 한 번에 보내는 건수 */
var BATCH_SIZE = 100;
/** 진행상태 7단계 (DB bookings.progress check 제약과 같음) */
var PROGRESS_STAGES = ['촬영 완료', '원본 전달', '셀렉 완료', '보정 중', '보정본 확인', '인화·발송', '완료'];

/**
 * 시트 헤더(한글) → DB 칸. 열 순서가 아니라 헤더 이름으로 찾음
 * kind: text 글자 / phone 전화번호 / datetime 한국시간 일시 / int 정수 / progress 진행상태
 * keepIfEmpty: 비어 있으면 그 칸을 보내지 않음 (DB 에 이미 있는 값을 지우지 않게) → N·O열 (직접 입력)
 * required: 이 헤더가 시트에 없으면 동기화를 멈춤 (A~M열)
 */
var COLUMNS = [
  { header: '예약번호', field: 'booking_no', kind: 'text', required: true },
  { header: '상태', field: 'naver_status', kind: 'text', required: true },
  { header: '예약자', field: 'name', kind: 'text', required: true },
  { header: '전화번호', field: 'phone', kind: 'phone', required: true },
  { header: '이메일(예약자정보)', field: 'email_booker', kind: 'text', required: true },
  { header: '촬영파일 이메일(입력)', field: 'email_files', kind: 'text', required: true },
  { header: '상품', field: 'product', kind: 'text', required: true },
  { header: '옵션', field: 'options', kind: 'text', required: true },
  { header: '이용일시', field: 'visit_at', kind: 'datetime', required: true },
  { header: '결제상태', field: 'pay_status', kind: 'text', required: true },
  { header: '결제금액', field: 'amount', kind: 'int', required: true },
  { header: '신청일시', field: 'applied_at', kind: 'datetime', required: true },
  { header: '주차(차량번호)', field: 'parking_car', kind: 'text', required: true },
  { header: '사진링크', field: 'photo_url', kind: 'text', keepIfEmpty: true },
  { header: '진행상태', field: 'progress', kind: 'progress', keepIfEmpty: true },
];

// =====================================================================
// 1) 동기화
// =====================================================================

/** 예약번호가 있는 모든 행을 Supabase bookings 에 upsert. 결과 { sent, failed } */
function syncBookings() {
  // 15분 트리거와 '지금 동기화'가 겹쳐 두 번 보내지 않게 잠금
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    console.log('다른 동기화가 실행 중이라 이번 실행은 건너뜀');
    return { sent: 0, failed: 0 };
  }
  try {
    var conf = readConfig_();
    var sheet = getSheet_();
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      console.log('전송 0건, 실패 0건');
      return { sent: 0, failed: 0 };
    }
    var colIndex = findColumns_(values[0]);

    var failed = 0;
    var byNo = {}; // 예약번호가 같은 행이 여러 개면 아래쪽(나중) 행을 씀
    var order = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var bookingNo = toBookingNo_(cell_(row, colIndex, 'booking_no'));
      if (!bookingNo) continue; // 예약번호 없는 행은 건너뜀
      var record = buildRecord_(row, colIndex, bookingNo);
      if (!record) {
        failed++;
        continue;
      }
      if (!byNo[bookingNo]) order.push(bookingNo);
      byNo[bookingNo] = record;
    }
    var records = order.map(function (no) {
      return byNo[no];
    });

    // 보내는 칸이 같은 행끼리 묶음 (사진링크·진행상태가 있는 행 / 없는 행)
    // → 한 묶음에 칸이 다른 행이 섞이면 Supabase 가 빠진 칸을 빈 값으로 덮어써서 DB 값이 지워질 수 있음
    var groups = {};
    records.forEach(function (rec) {
      var key = Object.keys(rec).sort().join(',');
      (groups[key] = groups[key] || []).push(rec);
    });

    var sent = 0;
    Object.keys(groups).forEach(function (key) {
      var list = groups[key];
      for (var i = 0; i < list.length; i += BATCH_SIZE) {
        var result = sendBatch_(conf, list.slice(i, i + BATCH_SIZE));
        sent += result.sent;
        failed += result.failed;
      }
    });

    console.log('전송 ' + sent + '건, 실패 ' + failed + '건');
    return { sent: sent, failed: failed };
  } finally {
    lock.releaseLock();
  }
}

/** 메뉴 '지금 동기화': 실행 후 시트 오른쪽 아래에 결과 알림 */
function syncNowFromMenu() {
  var result = syncBookings();
  SpreadsheetApp.getActiveSpreadsheet().toast('전송 ' + result.sent + '건, 실패 ' + result.failed + '건', '블루티티 동기화', 5);
}

/** 한 행 → DB 레코드. 이름·전화번호가 없으면 null (실패로 셈) */
function buildRecord_(row, colIndex, bookingNo) {
  var rec = { booking_no: bookingNo };
  for (var i = 0; i < COLUMNS.length; i++) {
    var c = COLUMNS[i];
    if (c.field === 'booking_no') continue;
    if (colIndex[c.field] === undefined) continue; // 시트에 없는 선택 열(N·O)
    var raw = row[colIndex[c.field]];
    var empty = raw === '' || raw === null || raw === undefined;

    if (c.keepIfEmpty && empty) continue; // 비어 있으면 보내지 않음 (DB 값 유지)

    var value;
    switch (c.kind) {
      case 'phone':
        value = toPhone_(raw);
        break;
      case 'datetime':
        value = toKstIso_(raw);
        if (value === undefined) {
          console.log('일시 형식을 읽지 못해 ' + c.header + ' 칸은 보내지 않음: 예약번호 ' + bookingNo);
          continue;
        }
        break;
      case 'int':
        value = toInt_(raw);
        break;
      case 'progress':
        value = String(raw).trim();
        if (PROGRESS_STAGES.indexOf(value) === -1) {
          console.log('진행상태가 7단계 값이 아니라 진행상태 칸만 빼고 보냄: 예약번호 ' + bookingNo);
          continue;
        }
        break;
      default:
        value = empty ? null : String(raw).trim();
        if (value === '') value = null;
    }
    rec[c.field] = value;
  }
  if (!rec.name || !rec.phone) {
    console.log('예약자 또는 전화번호가 비어 있어 보내지 않음: 예약번호 ' + bookingNo);
    return null;
  }
  return rec;
}

/** 묶음 upsert. 실패하면 한 건씩 다시 보내 실패한 예약번호만 로그에 남김 */
function sendBatch_(conf, records) {
  var res = postUpsert_(conf, records);
  if (res.ok) return { sent: records.length, failed: 0 };
  logHttpError_(res, records.length + '건 묶음', conf);
  if (records.length === 1) {
    console.log('실패 예약번호: ' + records[0].booking_no);
    return { sent: 0, failed: 1 };
  }
  // 인증 오류면 한 건씩 보내도 똑같이 실패하므로 바로 전부 실패 처리
  if (res.status === 401 || res.status === 403) return { sent: 0, failed: records.length };
  var sent = 0;
  var failed = 0;
  records.forEach(function (rec) {
    var one = postUpsert_(conf, [rec]);
    if (one.ok) {
      sent++;
    } else {
      failed++;
      console.log('실패 예약번호: ' + rec.booking_no + ' (HTTP ' + one.status + (one.code ? ', ' + one.code : '') + ')');
    }
  });
  return { sent: sent, failed: failed };
}

/**
 * Supabase REST(PostgREST) upsert
 * - on_conflict=booking_no + Prefer: resolution=merge-duplicates → 있으면 보낸 칸만 수정, 없으면 추가
 * - 키 헤더 (Supabase 문서 기준)
 *   새 secret 키(sb_secret_...): apikey 헤더에만. Authorization: Bearer 에 넣으면 JWT 로 읽혀 거절될 수 있음
 *   예전 service_role 키(JWT, eyJ...): apikey + Authorization: Bearer 둘 다
 */
function postUpsert_(conf, records) {
  var headers = {
    apikey: conf.key,
    Prefer: 'resolution=merge-duplicates,return=minimal',
  };
  if (isJwt_(conf.key)) headers.Authorization = 'Bearer ' + conf.key;

  var resp = UrlFetchApp.fetch(conf.url + '/rest/v1/bookings?on_conflict=booking_no', {
    method: 'post',
    contentType: 'application/json',
    headers: headers,
    payload: JSON.stringify(records),
    muteHttpExceptions: true,
  });
  var status = resp.getResponseCode();
  var code = '';
  if (status >= 300) {
    // 오류 본문의 message·details 에는 고객 정보가 들어갈 수 있어 오류 코드만 꺼냄
    try {
      code = JSON.parse(resp.getContentText()).code || '';
    } catch (e) {
      code = '';
    }
  }
  return { ok: status >= 200 && status < 300, status: status, code: code };
}

/** HTTP 오류를 고객 정보 없이 로그로 */
function logHttpError_(res, what, conf) {
  var hint = '';
  if (res.status === 401) {
    hint = isJwt_(conf.key)
      ? ' → SUPABASE_SECRET_KEY 에 넣은 service_role 키가 맞는지 확인해 주세요'
      : ' → 키가 맞는지 확인. sb_secret_ 키가 계속 401 이면 Supabase 가 요청을 브라우저로 판단한 경우일 수 있으니 예전 service_role 키로 바꿔 보세요 (README 문제 해결)';
  } else if (res.code === '42501') {
    hint = ' → service_role 에 bookings 권한이 없어요. 001_init.sql 을 다시 실행해 주세요';
  } else if (res.code === '23514') {
    hint = ' → 허용되지 않는 값(check 제약)이 있어요';
  } else if (res.code === '42P01' || res.status === 404) {
    hint = ' → bookings 테이블을 찾지 못했어요. SUPABASE_URL 과 001_init.sql 실행 여부를 확인해 주세요';
  }
  console.log(what + ' 전송 실패: HTTP ' + res.status + (res.code ? ', 오류코드 ' + res.code : '') + hint);
}

// =====================================================================
// 2) 처음 한 번 설정
// =====================================================================

/** 15분 트리거(중복 없이), N1·O1 헤더, O열 진행상태 드롭다운 */
function setup() {
  // 15분마다 syncBookings (이미 있으면 새로 만들지 않음)
  var exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'syncBookings' && t.getEventType() === ScriptApp.EventType.CLOCK;
  });
  if (!exists) {
    ScriptApp.newTrigger('syncBookings').timeBased().everyMinutes(15).create();
    console.log('15분 자동 동기화 트리거를 만들었어요');
  } else {
    console.log('15분 자동 동기화 트리거가 이미 있어요');
  }

  var sheet = getSheet_();
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 15)).getValues()[0].map(function (h) {
    return String(h).trim();
  });

  // N1 '사진링크', O1 '진행상태' (이미 다른 칸에 같은 헤더가 있으면 그대로)
  ensureHeader_(sheet, headers, 14, '사진링크'); // N
  ensureHeader_(sheet, headers, 15, '진행상태'); // O

  // 진행상태 열(헤더로 찾음)에 7단계 드롭다운. 목록에 없는 값은 입력 거부
  var lastHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
  var progressCol = lastHeaders.indexOf('진행상태') + 1;
  if (progressCol > 0 && sheet.getMaxRows() > 1) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(PROGRESS_STAGES, true)
      .setAllowInvalid(false)
      .setHelpText('진행상태 7단계 중에서 골라 주세요')
      .build();
    sheet.getRange(2, progressCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
    console.log('진행상태 열에 드롭다운을 설정했어요');
  }
}

/** col(1부터) 칸 1행에 헤더가 없으면 넣음. 이미 다른 칸에 같은 헤더가 있거나 그 칸에 다른 글자가 있으면 건드리지 않음 */
function ensureHeader_(sheet, headers, col, name) {
  if (headers.indexOf(name) !== -1) return;
  var current = headers[col - 1] || '';
  if (current === '') {
    sheet.getRange(1, col).setValue(name);
    headers[col - 1] = name;
    console.log(name + ' 헤더를 추가했어요');
  } else {
    console.log(sheet.getRange(1, col).getA1Notation() + ' 에 다른 헤더가 있어 ' + name + ' 헤더를 넣지 않았어요');
  }
}

// =====================================================================
// 3) 메뉴
// =====================================================================

function onOpen() {
  SpreadsheetApp.getUi().createMenu('블루티티').addItem('지금 동기화', 'syncNowFromMenu').addToUi();
}

// =====================================================================
// 값 변환
// =====================================================================

/** 예약번호: 숫자로 들어와도 글자로 (1234567 → "1234567") */
function toBookingNo_(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v));
  return String(v).trim();
}

/**
 * 전화번호: 하이픈 포함 원본 그대로. 숫자로 바뀌어 앞의 0이 빠졌으면 0을 붙이고 하이픈 넣기
 * 예) 1012345678 → 010-1234-5678, "1012345678" → 010-1234-5678, "010-1234-5678" → 그대로
 */
function toPhone_(v) {
  if (v === '' || v === null || v === undefined) return null;
  var s = typeof v === 'number' ? String(Math.round(v)) : String(v).trim();
  var digitsOnly = /^\d+$/.test(s);
  if (!digitsOnly) return s; // 하이픈·공백이 있는 원본은 그대로
  if (s.charAt(0) !== '0') s = '0' + s; // 빠진 앞자리 0 복원
  return hyphenatePhone_(s);
}

/** 숫자만 있는 국내 번호에 하이픈 (02 지역번호·휴대폰·0507 등) */
function hyphenatePhone_(d) {
  if (d.indexOf('02') === 0) {
    if (d.length === 9) return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
    if (d.length === 10) return d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6);
  }
  if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  if (d.length === 12) return d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8); // 0507-xxxx-xxxx 등
  return d;
}

/** 결제금액: 쉼표·'원' 등 빼고 정수. 비어 있거나 숫자가 없으면 null */
function toInt_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return Math.round(v);
  var s = String(v).replace(/[^0-9-]/g, '');
  if (s === '' || s === '-') return null;
  var n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

/**
 * 일시 → 한국시간 ISO 문자열 (예: 2026-11-14T11:30:00+09:00)
 * - Date 객체: 그 시각을 한국시간으로 표기
 * - 문자열: '2026-11-14 11:30', '2026.11.14 11:30:00', '2026-11-14(금) 오후 2:30' 등을 한국시간으로 읽음
 * 비어 있으면 null, 읽을 수 없으면 undefined (그 칸은 보내지 않음)
 */
function toKstIso_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return undefined;
    return Utilities.formatDate(v, 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss") + '+09:00';
  }
  var s = String(v).trim();
  var m = s.match(/(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})\s*일?\s*(?:\([^)]*\))?\s*(오전|오후|AM|PM|am|pm)?\s*(?:(\d{1,2})\s*(?::|시)\s*(\d{1,2})?\s*분?(?::(\d{1,2}))?)?/);
  if (!m) return undefined;
  var y = +m[1];
  var mo = +m[2];
  var d = +m[3];
  var ampm = m[4] || '';
  var h = m[5] !== undefined ? +m[5] : 0;
  var mi = m[6] !== undefined ? +m[6] : 0;
  var sec = m[7] !== undefined ? +m[7] : 0;
  if (/오후|PM|pm/.test(ampm) && h < 12) h += 12;
  if (/오전|AM|am/.test(ampm) && h === 12) h = 0;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || sec > 59) return undefined;
  return y + '-' + pad2_(mo) + '-' + pad2_(d) + 'T' + pad2_(h) + ':' + pad2_(mi) + ':' + pad2_(sec) + '+09:00';
}

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

// =====================================================================
// 도우미
// =====================================================================

/** 스크립트 속성에서 접속 정보 읽기 (값은 로그에 남기지 않음) */
function readConfig_() {
  var props = PropertiesService.getScriptProperties();
  var url = (props.getProperty('SUPABASE_URL') || '').trim().replace(/\/+$/, '');
  var key = (props.getProperty('SUPABASE_SECRET_KEY') || '').trim();
  if (!url || !key) {
    throw new Error('스크립트 속성 SUPABASE_URL, SUPABASE_SECRET_KEY 를 먼저 입력해 주세요 (README 3단계)');
  }
  if (key.indexOf('sb_publishable_') === 0) {
    throw new Error('SUPABASE_SECRET_KEY 에 publishable 키가 들어 있어요. secret 키(sb_secret_...)를 넣어 주세요');
  }
  return { url: url, key: key };
}

/** 예전 service_role 키처럼 JWT(점 2개, eyJ 로 시작)인지 */
function isJwt_(key) {
  return key.indexOf('eyJ') === 0 && key.split('.').length === 3;
}

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TAB);
  if (!sheet) throw new Error("'" + SHEET_TAB + "' 탭을 찾지 못했어요");
  return sheet;
}

/** 1행 헤더 → { field: 열 번호(0부터) }. A~M 헤더가 없으면 멈춤 */
function findColumns_(headerRow) {
  var names = headerRow.map(function (h) {
    return String(h).trim();
  });
  var index = {};
  var missing = [];
  COLUMNS.forEach(function (c) {
    var i = names.indexOf(c.header);
    if (i === -1) {
      if (c.required) missing.push(c.header);
    } else {
      index[c.field] = i;
    }
  });
  if (missing.length) throw new Error('시트 1행에서 헤더를 찾지 못했어요: ' + missing.join(', '));
  return index;
}

function cell_(row, colIndex, field) {
  return colIndex[field] === undefined ? '' : row[colIndex[field]];
}
