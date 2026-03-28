// 고소장 PDF 출력 엔진
// HTML 변환 → expo-print PDF 생성 → expo-sharing 공유
// 검토: 김창희 변호사 (법률사무소 청송)

import { ComplaintDocument, applyMasking } from './complaint-generator';

// ─── 공개 API ───────────────────────────────────────────────

/**
 * 고소장 구조체 → 인쇄용 HTML 변환
 * A4 크기(210mm x 297mm), 한글 시스템 폰트, 법률문서 마진(25mm)
 */
export function generateComplaintHTML(complaint: ComplaintDocument): string {
  const masking = complaint.maskingLevel || 'none';

  // 날짜 포맷
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

  // 고소인 정보
  const complainantName = maskText(complaint.complainant.name, masking);
  const complainantBirth = complaint.complainant.birthDate || '';
  const complainantAddress = complaint.complainant.address || '';
  const complainantPhone = complaint.complainant.phone
    ? maskText(complaint.complainant.phone, masking)
    : '';

  // 피고소인 정보
  const suspectName = complaint.suspect.name
    ? maskText(complaint.suspect.name, masking)
    : '인적사항 불상';
  const suspectAddress = complaint.suspect.address || '불상';
  const suspectPhone = complaint.suspect.phone
    ? maskText(complaint.suspect.phone, masking)
    : '불상';

  // 범죄사실 HTML
  const crimeFactsHTML = complaint.crimeFacts.map(fact => {
    const sixW = [
      fact.when ? `일시: ${fact.when}` : null,
      fact.where ? `장소: ${fact.where}` : null,
    ].filter(Boolean).join(', ');

    return `
      <div class="fact-item">
        <p><strong>${escapeHTML(fact.label)}</strong> ${escapeHTML(fact.detail)}</p>
        ${sixW ? `<p class="fact-detail">(${escapeHTML(sixW)})</p>` : ''}
      </div>
    `;
  }).join('');

  // 적용법조 HTML
  const statutesHTML = complaint.applicableStatutes.map((s, i) => `
    <tr>
      <td class="center">${i + 1}</td>
      <td>${escapeHTML(s.lawName)}</td>
      <td>${escapeHTML(s.article)}</td>
      <td>${escapeHTML(s.penalty)}</td>
    </tr>
  `).join('');

  // 증거 목록 HTML (테이블)
  const evidenceHTML = complaint.evidenceItems.length > 0
    ? complaint.evidenceItems.map(e => `
      <tr>
        <td class="center">${e.number}</td>
        <td>${escapeHTML(e.type)}</td>
        <td>${escapeHTML(e.description)}</td>
        <td class="small">${escapeHTML(e.timestamp)}</td>
        <td class="hash">${escapeHTML(e.sha256Hash)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" class="center">추후 보강 예정</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* ── A4 크기 + 법률문서 마진 ── */
    @page {
      size: A4;
      margin: 25mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 25mm;
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR',
                   '맑은 고딕', '돋움', sans-serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #222;
      background: #fff;
    }

    /* ── 표제부 ── */
    .title {
      text-align: center;
      font-size: 22pt;
      font-weight: bold;
      letter-spacing: 12pt;
      margin-bottom: 30pt;
      padding-bottom: 10pt;
      border-bottom: 2px solid #333;
    }

    /* ── 당사자 정보 ── */
    .party-section {
      margin-bottom: 20pt;
    }
    .party-label {
      font-weight: bold;
      font-size: 13pt;
      margin-bottom: 4pt;
    }
    .party-info {
      padding-left: 20pt;
      margin-bottom: 8pt;
    }
    .party-info p {
      margin: 2pt 0;
    }

    /* ── 섹션 제목 ── */
    .section-title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 8pt;
      margin: 24pt 0 16pt 0;
    }

    /* ── 본문 ── */
    .content {
      text-indent: 20pt;
      margin-bottom: 12pt;
      text-align: justify;
    }

    .fact-item {
      margin-bottom: 12pt;
      padding-left: 20pt;
    }
    .fact-item p {
      margin: 2pt 0;
    }
    .fact-detail {
      color: #555;
      font-size: 11pt;
      padding-left: 24pt;
    }

    /* ── 구분선 ── */
    .divider {
      border: none;
      border-top: 1px solid #ccc;
      margin: 16pt 0;
    }

    /* ── 테이블 ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #999;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }
    .center { text-align: center; }
    .small { font-size: 9pt; }
    .hash {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 7pt;
      word-break: break-all;
    }

    /* ── 서명란 ── */
    .signature-section {
      margin-top: 40pt;
      text-align: right;
    }
    .signature-date {
      margin-bottom: 16pt;
    }
    .signature-name {
      font-size: 13pt;
    }
    .signature-seal {
      margin-left: 8pt;
      color: #999;
    }

    /* ── 제출처 ── */
    .submission {
      text-align: center;
      margin-top: 30pt;
      font-size: 13pt;
      font-weight: bold;
    }

    /* ── 면책 고지 ── */
    .disclaimer {
      margin-top: 40pt;
      padding: 12pt;
      border: 1px dashed #aaa;
      background: #fafafa;
      font-size: 9pt;
      color: #777;
      text-align: center;
      line-height: 1.6;
    }

    /* ── 피해 결과 ── */
    .damage-content {
      padding-left: 20pt;
      margin-bottom: 12pt;
    }

    /* ── 페이지 나눔 방지 ── */
    .no-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <!-- 표제부 -->
  <div class="title">고 소 장</div>

  <!-- 고소인 -->
  <div class="party-section">
    <div class="party-label">고 소 인</div>
    <div class="party-info">
      <p>성&nbsp;&nbsp;&nbsp;&nbsp;명: ${escapeHTML(complainantName)}${complainantBirth ? ` (${escapeHTML(complainantBirth)})` : ''}</p>
      ${complainantAddress ? `<p>주&nbsp;&nbsp;&nbsp;&nbsp;소: ${escapeHTML(complainantAddress)}</p>` : ''}
      ${complainantPhone ? `<p>연 락 처: ${escapeHTML(complainantPhone)}</p>` : ''}
    </div>
  </div>

  <!-- 피고소인 -->
  <div class="party-section">
    <div class="party-label">피고소인</div>
    <div class="party-info">
      <p>성&nbsp;&nbsp;&nbsp;&nbsp;명: ${escapeHTML(suspectName)}</p>
      <p>주&nbsp;&nbsp;&nbsp;&nbsp;소: ${escapeHTML(suspectAddress)}</p>
      <p>연 락 처: ${escapeHTML(suspectPhone)}</p>
    </div>
  </div>

  <hr class="divider" />

  <!-- 고소취지 -->
  <div class="section-title">고 소 취 지</div>
  <p class="content">
    고소인은 피고소인을 아래와 같은 범죄사실로 고소하오니,
    수사하여 엄벌에 처하여 주시기 바랍니다.
  </p>

  <hr class="divider" />

  <!-- 범죄사실 -->
  <div class="section-title">범 죄 사 실</div>

  <div class="no-break">
    <p style="font-weight: bold; margin-bottom: 8pt;">1. 당사자의 관계</p>
    <p class="content">${escapeHTML(complaint.relationshipDetail)}</p>
  </div>

  <div class="no-break">
    <p style="font-weight: bold; margin-bottom: 8pt;">2. 범죄사실</p>
    ${crimeFactsHTML}
  </div>

  <hr class="divider" />

  <!-- 적용법조 -->
  <div class="section-title">적 용 법 조</div>
  <table class="no-break">
    <thead>
      <tr>
        <th style="width:8%">순번</th>
        <th style="width:30%">법률명</th>
        <th style="width:30%">조항</th>
        <th style="width:32%">법정형</th>
      </tr>
    </thead>
    <tbody>
      ${statutesHTML}
    </tbody>
  </table>

  <hr class="divider" />

  <!-- 증거자료 -->
  <div class="section-title">증 거 자 료</div>
  <table>
    <thead>
      <tr>
        <th style="width:6%">번호</th>
        <th style="width:12%">유형</th>
        <th style="width:30%">설명</th>
        <th style="width:18%">일시</th>
        <th style="width:34%">SHA-256 해시</th>
      </tr>
    </thead>
    <tbody>
      ${evidenceHTML}
    </tbody>
  </table>

  ${complaint.damageDescription ? `
  <hr class="divider" />

  <!-- 피해 결과 -->
  <div class="section-title">피 해 결 과</div>
  <div class="damage-content">
    <p>${escapeHTML(complaint.damageDescription)}</p>
  </div>
  ` : ''}

  <hr class="divider" />

  <!-- 결어 -->
  <div class="section-title">결 어</div>
  <p class="content">
    ${complaint.punishmentRequest || '위와 같이 고소하오니 철저히 수사하시어 피고소인을 엄중히 처벌하여 주시기 바랍니다.'}
  </p>

  <!-- 서명란 -->
  <div class="signature-section">
    <p class="signature-date">${escapeHTML(dateStr)}</p>
    <p class="signature-name">
      고소인 &nbsp; ${escapeHTML(complainantName)}
      <span class="signature-seal">(인)</span>
    </p>
  </div>

  <!-- 제출처 -->
  <div class="submission">
    ${escapeHTML(complaint.policeStation || '○○경찰서장')} 귀중
  </div>

  <!-- 면책 고지 -->
  <div class="disclaimer">
    ※ 본 문서는 AI가 작성한 초안이며,<br/>
    법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다.<br/>
    <br/>
    안전이별 앱 | 법률사무소 청송 (대표변호사 김창희)
  </div>

</body>
</html>
  `.trim();
}

/**
 * HTML → PDF 파일 생성
 * expo-print의 printToFileAsync 사용
 * 파일명: SB-고소장-YYYYMMDD-NNNN.pdf
 */
export async function createComplaintPDF(html: string): Promise<string> {
  try {
    // expo-print는 아직 미설치일 수 있으므로 dynamic import + try-catch
    const Print = await import('expo-print');

    // 파일명 생성
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const fileName = `SB-고소장-${y}${m}${d}-${seq}`;

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // expo-print는 임시 경로에 생성하므로, 파일명을 반환값에 포함
    // 실제 파일 URI가 반환됨
    console.log(`[고소장 PDF] 생성 완료: ${fileName}.pdf`);
    console.log(`[고소장 PDF] 경로: ${uri}`);

    return uri;
  } catch (error) {
    console.error('[고소장 PDF] 생성 실패:', error);
    throw new Error(
      'PDF 생성에 실패했습니다. expo-print 패키지가 설치되어 있는지 확인해 주세요.\n' +
      '설치: npx expo install expo-print'
    );
  }
}

/**
 * PDF 파일 공유 (다운로드/전송)
 * expo-sharing의 shareAsync 사용
 * 피해자가 다운로드 후 직접 경찰에 제출 (개인정보보호법 준수)
 */
export async function shareComplaintPDF(fileUri: string): Promise<void> {
  try {
    const Sharing = await import('expo-sharing');

    // 공유 가능 여부 확인
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('이 기기에서는 파일 공유가 지원되지 않습니다.');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: '고소장 PDF 저장/공유',
      UTI: 'com.adobe.pdf', // iOS용
    });

    console.log('[고소장 PDF] 공유 완료');
  } catch (error) {
    console.error('[고소장 PDF] 공유 실패:', error);
    throw new Error(
      'PDF 공유에 실패했습니다. expo-sharing 패키지가 설치되어 있는지 확인해 주세요.\n' +
      '설치: npx expo install expo-sharing'
    );
  }
}

// ─── 경고장 HTML ────────────────────────────────────────────

/**
 * 경고장 HTML (법률사무소 레터헤드)
 * letter: generateWarningLetter()가 생성한 텍스트
 * type: 'strong' | 'moderate'
 */
export function generateWarningLetterHTML(letter: string, type: 'strong' | 'moderate'): string {
  const accentColor = type === 'strong' ? '#8B0000' : '#2F4F4F';
  const typeLabel = type === 'strong' ? '강경 경고장' : '온건 경고장';

  // 텍스트를 HTML 단락으로 변환
  const bodyHTML = escapeHTML(letter)
    .split('\n\n')
    .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 25mm;
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR',
                   '맑은 고딕', '돋움', sans-serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #222;
      background: #fff;
    }
    .letterhead {
      text-align: center;
      border-bottom: 3px double ${accentColor};
      padding-bottom: 16pt;
      margin-bottom: 24pt;
    }
    .letterhead h1 {
      font-size: 18pt;
      color: ${accentColor};
      letter-spacing: 4pt;
      margin-bottom: 4pt;
    }
    .letterhead .firm {
      font-size: 10pt;
      color: #666;
    }
    .badge {
      display: inline-block;
      background: ${accentColor};
      color: #fff;
      padding: 2pt 12pt;
      border-radius: 4pt;
      font-size: 9pt;
      margin-bottom: 16pt;
    }
    .body-content p {
      margin-bottom: 10pt;
      text-align: justify;
      white-space: pre-wrap;
    }
    .disclaimer {
      margin-top: 40pt;
      padding: 12pt;
      border: 1px dashed #aaa;
      background: #fafafa;
      font-size: 9pt;
      color: #777;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <h1>법률사무소 청송</h1>
    <div class="firm">대표변호사 김창희 | TEL 02-XXX-XXXX</div>
  </div>

  <div style="text-align:center;margin-bottom:20pt;">
    <span class="badge">${escapeHTML(typeLabel)}</span>
  </div>

  <div class="body-content">
    ${bodyHTML}
  </div>

  <div class="disclaimer">
    ※ 본 문서는 AI가 작성한 초안이며,<br/>
    법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다.<br/>
    <br/>
    안전이별 앱 | 법률사무소 청송 (대표변호사 김창희)
  </div>
</body>
</html>
  `.trim();
}

/**
 * 증거 분석 보고서 HTML (police-report 기능 흡수)
 * report: generateEvidenceReport()가 생성한 텍스트
 */
export function generateEvidenceReportHTML(report: string): string {
  // 텍스트를 HTML 단락으로 변환
  const bodyHTML = escapeHTML(report)
    .split('\n\n')
    .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 25mm;
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR',
                   '맑은 고딕', '돋움', sans-serif;
      font-size: 11pt;
      line-height: 1.8;
      color: #222;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1a365d;
      padding-bottom: 16pt;
      margin-bottom: 24pt;
    }
    .header h1 {
      font-size: 16pt;
      color: #1a365d;
      letter-spacing: 8pt;
      margin-bottom: 8pt;
    }
    .header .subtitle {
      font-size: 10pt;
      color: #666;
    }
    .body-content p {
      margin-bottom: 8pt;
      text-align: justify;
      white-space: pre-wrap;
    }
    .disclaimer {
      margin-top: 40pt;
      padding: 12pt;
      border: 1px dashed #aaa;
      background: #fafafa;
      font-size: 9pt;
      color: #777;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>증거 분석 보고서</h1>
    <div class="subtitle">경찰 제출용 | 법률사무소 청송 (대표변호사 김창희)</div>
  </div>

  <div class="body-content">
    ${bodyHTML}
  </div>

  <div class="disclaimer">
    ※ 본 보고서는 AI가 작성한 초안이며,<br/>
    법률사무소 청송 담당 변호사의 검토를 거쳤습니다.<br/>
    <br/>
    안전이별 앱 | 법률사무소 청송 (대표변호사 김창희)
  </div>
</body>
</html>
  `.trim();
}

// ─── 내부 헬퍼 ──────────────────────────────────────────────

/** HTML 이스케이프 (XSS 방지) */
function escapeHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** 텍스트 마스킹 적용 (applyMasking 래퍼) */
function maskText(text: string, level: 'full' | 'partial' | 'none'): string {
  return applyMasking(text, level);
}
