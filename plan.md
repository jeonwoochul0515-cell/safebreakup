# 안전이별 — 고소장 자동 작성 + 행위중지 서류 시스템 구현 계획

> 작성일: 2026-03-28 (업데이트: 2026-03-28)
> 기반: research.md (법적 타당성, 개인정보보호, 시장성, **대법원 2023도6411 판례**, 스토킹 유형 분류, 행위중지 서류 전략)

---

## 시스템 개요

```
                        ┌─→ [경고장/내용증명 PDF] (1단계 대응)
[피해자] ←→ [사무장] ←→ [팩트] ←→ [변호사 김창희] ─→ [고소장 PDF] (3단계 대응)
         (위로+수집)              (법조매칭+생성)  └─→ [잠정조치 청구서] (3단계+)
```

**두 AI 페르소나:**
1. **사무장 (법률사무장)** — 피해자와 대화하며 감정적 위로 + 사실관계 체계적 수집
2. **김창희 (11년차 변호사)** — 수집된 팩트를 고소장/경고장/내용증명 등 **11종 서류**로 변환, 법조 자동 매칭

**서비스 흐름 — 4단계 대응 전략 (research.md 8-1):**
```
[1단계] 경고장/내용증명 발송 → 60~70% 여기서 해결
    ↓ (행위 계속 시)
[2단계] 112 신고 → 긴급응급조치 (100m 접근금지)
    ↓ (행위 계속 시)
[3단계] 고소 → 잠정조치 + 민사 가처분
    ↓ (유죄 판결 시)
[4단계] 형사 처벌 + 민사 손해배상
```

**핵심 법적 근거 — 대법원 2023도6411 (research.md 6장):**
> "경미한 행위라도 **누적·반복**되면 스토킹 범죄. 현실적 공포심 불필요 — **객관적·일반적 기준**으로 판단."
> → 앱의 **시간순 누적 기록**이 이 판례가 요구하는 "누적적·포괄적 평가"의 **직접 증거**가 됨

---

## Phase 1: 기반 작업

### 1-1. 타입 정의 — `types/database.ts` 수정

```typescript
// 고소장 작성 7단계
type ComplaintPhase = 'safety' | 'complainant' | 'suspect' | 'crime_facts' | 'evidence' | 'damage' | 'punishment';

// 범죄 유형
type CrimeType = 'stalking' | 'threat' | 'assault' | 'sexual' | 'digital_sexual' | 'other';

// 고소장 전체 데이터
interface ComplaintDraftData {
  session_id: string;
  created_at: string;
  last_updated_at: string;
  completion_status: 'in_progress' | 'completed' | 'paused';

  stage1_safety: Stage1Data;
  stage2_complainant: Stage2Data;
  stage3_suspect: Stage3Data;
  stage4_crime: CrimeFactsData;
  stage5_evidence: Stage5Data;
  stage6_damage: Stage6Data;
  stage7_punishment: Stage7Data;

  applicable_laws: string[];
  draft_text?: string;
}

// 민감정보 동의 상태
interface SensitiveDataConsent {
  general_consent: boolean;
  sensitive_consent: boolean;  // 별도 동의 (개인정보보호법 제23조)
  timestamp: string;
}
```

### 1-2. 상수 파일 — `constants/complaint.ts` 업데이트 필요

**추가/수정할 상수:**
- `CASE_REFERENCES` — **대법원 2023도6411 추가** (경미행위 누적 = 스토킹, 위험범, 객관적 기준)
- `STALKING_TYPES` — **법정 6가지 유형 (가~바목)** + 실무 12가지 세부 유형 (research.md 7장)
- `STALKING_JUDGMENT_FACTORS` — 대법원이 제시한 5가지 종합 판단 기준 (관계·경위·태양·언동·상황)
- `DOCUMENT_TYPES` — 생성 가능 서류 11종 목록 (research.md 8-5)
- `RESPONSE_STAGES` — 4단계 대응 전략 상수
- `PROTECTION_MEASURES` — 스토킹처벌법상 보호조치 3종 (응급/긴급응급/잠정)
- `LAW_AMENDMENTS_2024` — 2024년 개정사항 5건 (반의사불벌죄 폐지, 바목 신설 등)

**기존 유지:**
- `COMPLAINT_PHASES` — 7단계 라벨/설명
- `EMPATHY_RESPONSES` — 사무장 공감 문구
- `APPLICABLE_STATUTES` — 법조 매칭 데이터
- `EMOTIONAL_PROTOCOLS` — 감정 대응 규칙
- `COMPLAINT_TEMPLATE` — 고소장 섹션 구조

### 1-3. 동의 화면 상수 — `constants/consent.ts` 신규 생성

- 민감정보 유형 목록 (건강정보, 성생활 정보 등)
- 동의 문구 (개인정보보호법 제23조 준거)
- 가해자 정보 마스킹 옵션

### 1-4. 패키지 설치

```bash
npx expo install expo-print expo-sharing
```

---

## Phase 2: 사무장 대화 엔진

### 2-1. `lib/complaint-secretary.ts` 신규 생성

기존 `lib/ai-secretary.ts`의 Map 기반 세션 패턴을 따름.

**7단계 대화 시나리오:**

#### STAGE 1: 안전 확인 + 공감

```
사무장: "안녕하세요, 법률사무장 사무장입니다.
        오늘 용기 내어 찾아와 주셔서 감사합니다.
        먼저 가장 중요한 걸 여쭤볼게요.
        지금 안전한 곳에 계신가요?"

→ 위험 감지 시: 긴급 프로토콜 (112, 1366 안내)
→ 안전 확인 시: STAGE 2로
```

#### STAGE 2: 고소인(피해자) 정보

```
수집 항목:
- 성명, 생년월일, 주소, 연락처, 직업(선택)

사무장: "고소장에 들어갈 기본 정보를 여쭤볼게요.
        법적 서류에 필요한 부분이라 좀 딱딱하게 느껴지실 수 있는데,
        정확하게 적어야 절차가 순탄하게 진행돼요."
```

#### STAGE 3: 피고소인(가해자) 정보

```
수집 항목:
- 성명(또는 "인적사항 불상"), 주소, 연락처, SNS
- 관계, 교제 기간, 이별 시기
- 외형 특징(이름 모를 경우)

사무장: "알고 계신 만큼만 말씀해 주시면 돼요.
        이름을 모르더라도 고소는 가능하니 걱정 마세요."
```

#### STAGE 4: 범죄사실 수집 (핵심)

**4-0: 피해 유형 선별**
```
사무장: "어떤 종류의 피해를 겪으셨는지 먼저 간단히 여쭤볼게요:
        1. 반복적 연락/따라다님 (스토킹)
        2. 해치겠다/퍼뜨리겠다 등 위협 (협박)
        3. 신체적 폭력 (폭행/상해)
        4. 성적 피해 (성범죄)
        5. 사진/영상 촬영·유포·협박 (디지털 성범죄)
        6. 기타"
```

**★ 판례 반영 — "이 정도는 아닌 것 같아요" 대응 (대법원 2023도6411):**
```
사무장: "혹시 '이 정도는 스토킹이 아닐 것 같다'고 생각하고 계신가요?
        대법원은 2023년에 '경미한 행위라도 반복되면 스토킹 범죄'라고
        명확히 판결했어요. 작은 것도 빠짐없이 기록해 두시는 게 중요합니다."
```

**스토킹 선택 시 — 12가지 세부 유형 선별 (research.md 7-2 반영):**
```
사무장: "스토킹이 어떤 형태로 이루어졌는지 해당되는 것을 모두 골라주세요:
        1. 따라다니거나 접근해 옴
        2. 집/직장/학교 앞에서 기다리거나 지켜봄
        3. 반복 전화, 부재중 전화, 문자 폭탄
        4. SNS DM, 이메일, 온라인 괴롭힘
        5. 원치 않는 선물/택배 배달
        6. 지인을 통해 연락/접촉 시도
        7. GPS/에어태그 등 위치 추적
        8. 개인정보를 온라인에 유포/사칭 계정 생성
        9. 물건이나 차량 파손
        10. '자해하겠다/죽겠다' 식의 협박
        11. 기타"
```

**선택된 유형별 서브스테이지:**

| 유형 | 수집 항목 | 적용 법조 | 법정 분류 |
|------|-----------|-----------|:---------:|
| 스토킹 | 행위 유형(12종), 시작 시기, 빈도, 장소, 최근 사건 | 스토킹처벌법 제18조 | 가~바목 |
| 협박 | 협박 내용(원문), 수단, 시기/횟수, 위해 유형 | 형법 제283조/제284조 | — |
| 폭행/상해 | 일시, 장소, 방법, 상해 정도, 치료 여부, 목격자 | 형법 제260조/제257조 | — |
| 성범죄 | (매우 조심스럽게) 발생 여부, 시기, 장소 | 형법 제297조~, 성폭력처벌법 | — |
| 디지털 성범죄 | 불법촬영, 유포/협박 여부, 유포 경로 | 성폭력처벌법 제14조 | — |

**★ 스토킹 세부 유형별 법조 자동 매칭 (research.md 7-1 반영):**

| 세부 유형 | 법정 분류 | 결합 범죄 |
|-----------|:---------:|-----------|
| 물리적 접근/추적 | 가목 | — |
| 주거/직장 감시·대기 | 나목 | — |
| 전화·문자 반복 | 다목 | — |
| SNS·이메일·온라인 | 다목 | 정보통신망법 |
| 선물·택배 전달 | 라목 | — |
| 제3자 이용 간접 접촉 | 라목 | — |
| GPS·위치추적 | 바목 | 위치정보법 |
| 개인정보 유출·사칭 | 바목 | — |
| 재물손괴 | 마목 | 형법 제366조 |
| 주거침입 | 가목 | 형법 제319조 |
| 자해·자살 협박 | 다목 | 형법 제283조, 제324조 |

**★ 경합범 자동 감지 (research.md 7-4 반영):**
- 여러 유형 선택 시 → 경합범(형법 제37조) 자동 표시
- 흉기 언급 시 → 특수스토킹(제18조 제2항) 자동 업그레이드

**성범죄 단계 특별 프로토콜:**
```
사무장: "이 부분은 말씀하시기 정말 힘드실 수 있어요.
        절대 무리하지 않으셔도 돼요.
        '건너뛰기'라고 하시면 바로 다음으로 넘어갈게요.
        잘못은 전적으로 가해자에게 있습니다."
```

#### STAGE 5: 증거 확보 현황

```
수집 항목:
- 문자/메신저 캡처, 녹음, CCTV, 진단서, 목격자, 112 신고 이력

+ 증거보관함 자동 연동:
  → loadAllEvidence()로 기존 증거 목록 표시
  → 사용자가 선택하면 고소장 증거 목록에 자동 포함
  → 타임스탬프 + SHA-256 해시값 병합

사무장: "갖고 계신 증거에 대해 여쭤볼게요.
        증거가 많을수록 유리하지만, 지금 당장 없어도 괜찮아요."
```

#### STAGE 6: 피해 결과

```
수집 항목:
- 신체적 피해 (상해, 치료 중 여부)
- 정신적 피해 (불안, 공포, 불면, 우울, PTSD)
- 경제적 피해 (이사비, 치료비, 수입 감소)
- 사회적 피해 (직장, 학업, 대인관계)
```

#### STAGE 7: 처벌 희망

```
수집 항목:
- 엄벌 희망 여부
- 보호조치: 접근금지, 연락금지, 전자장치 부착
- 추가 요청사항

사무장: "마지막이에요. 정말 잘 해주셨어요."
```

### 2-2. 감정 대응 프로토콜 (전 단계 공통)

| 감지 트리거 | 사무장 대응 | 동작 |
|-------------|-------------|------|
| 울음 (ㅠㅠ, 눈물) | "괜찮아요. 울어도 돼요. 천천히 하세요." | 일시정지, 대기 |
| 공포 (무서워, 두려워) | "무서우신 게 당연해요. 법이 보호해 줄 거예요." | 안심 후 계속 |
| 자기비난 (내 잘못) | "절대 본인 잘못이 아니에요. 책임은 가해자에게 있어요." | 강력 교정 |
| 포기 (못하겠다, 그만) | "지금까지 하신 것만으로도 충분해요. 저장해 둘 테니 나중에 이어서 할 수 있어요." | 세션 저장 |
| 자해 (죽고 싶다) | "혼자 감당하지 마세요. 지금 바로 1393에 전화해 주세요." | **긴급 개입** |

---

## Phase 3: 김창희 변호사 고소장 생성 엔진

### 3-1. `lib/complaint-generator.ts` 업데이트 필요

**기존 함수 (구현 완료):**
```typescript
generateComplaint(facts, evidenceItems): ComplaintDocument
matchStatutes(crimeTypes, behaviors): ApplicableStatute[]
generateComplaintText(complaint): string
applyMasking(text, level): string
mergeEvidenceFromVault(evidenceIds): ComplaintEvidenceItem[]
```

**★ 추가/수정할 함수:**
```typescript
// [추가] 대법원 2023도6411 판례 기반 — 누적적·포괄적 평가 논증 자동 생성
generateCumulativeArgument(incidents: CrimeFact[]): string
  // "피고소인의 행위는 개별적으로는 경미해 보일 수 있으나,
  //  대법원 2023도6411 판결에 따라 누적적·포괄적으로 평가하면
  //  불안감 또는 공포심을 일으키기에 충분한 일련의 행위에 해당합니다."

// [추가] 경고장/내용증명 텍스트 생성 (고소장과 별개)
generateWarningLetter(facts, type: 'strong' | 'moderate'): string
  // 강경: 법적 조치 예고 + 적용 법조 명시 + 증거 목록
  // 온건: 연락/접근 중단 요청 + 이별 의사 명확화

// [추가] 연락중지/접근금지 요청서 생성
generateStopContactRequest(facts): string
generateNoApproachRequest(facts): string

// [추가] 대응 단계 자동 추천
recommendResponseStage(facts): 'warning' | 'police_report' | 'complaint' | 'injunction'
  // 행위 심각도 + 빈도 + 기간을 분석하여 적절한 대응 단계 추천

// [수정] findRelevantCases — 2023도6411 포함
findRelevantCases(categories): CaseReference[]
  // 스토킹 → 2023도6411(경미행위 누적), 2022도12037(부재중 전화)
  // 협박 → 2015도7626(자해 협박)
  // 디지털 → 2024고단4265(유튜브 개인정보 공개)
```

**★ 고소장 범죄사실 서술 시 판례 자동 인용 로직:**
- 스토킹 행위가 경미하거나 빈도가 낮은 경우 → 2023도6411 인용하여 "누적적·포괄적 평가" 논증 삽입
- 부재중 전화만 있는 경우 → 2022도12037 인용
- 경합범 있는 경우 → 형법 제37조/제38조 자동 적시

### 3-2. 적용 법조 자동 매칭 테이블

| 카테고리 | 키워드/행위 | 적용 법조 | 법정형 |
|---------|------------|----------|--------|
| 스토킹 | 반복연락, 미행, 배회 | 스토킹처벌법 제18조 제1항 | 3년↓ 징역 / 3천만원↓ 벌금 |
| 스토킹(흉기) | 흉기+스토킹 | 스토킹처벌법 제18조 제2항 | 5년↓ / 5천만원↓ |
| 협박 | 죽이겠다, 가만안둔다 | 형법 제283조 제1항 | 3년↓ / 500만원↓ |
| 특수협박 | 흉기+협박 | 형법 제284조 | 7년↓ / 1천만원↓ |
| 강요 | 자해협박+행동강요 | 형법 제324조 | 5년↓ 징역 |
| 폭행 | 때림, 밀침 | 형법 제260조 제1항 | 2년↓ / 500만원↓ |
| 상해 | 폭행+진단서 | 형법 제257조 제1항 | 7년↓ 징역 |
| 특수폭행 | 흉기+폭행 | 형법 제261조 | 5년↓ / 1천만원↓ |
| 불법촬영 | 동의없는 촬영 | 성폭력처벌법 제14조 제1항 | 7년↓ / 5천만원↓ |
| 유포 | 촬영물 유포 | 성폭력처벌법 제14조 제2항 | 7년↓ / 5천만원↓ |
| 유포협박 | 사진뿌리겠다 | 성폭력처벌법 제14조의3 제1항 | **1년↑ 징역** |
| 딥페이크 | 합성, AI생성 | 성폭력처벌법 제14조의2 | 5년↓ / 5천만원↓ |
| 명예훼손 | 사실적시+전파 | 형법 제307조 | 2년↓ / 500만원↓ |
| 사이버명예훼손 | SNS+명예훼손 | 정보통신망법 제70조 | 3년↓ / 3천만원↓ |
| 모욕 | 욕설 (사실적시 없음) | 형법 제311조 | 1년↓ / 200만원↓ |
| 주거침입 | 집에 침입 | 형법 제319조 제1항 | 3년↓ / 500만원↓ |
| 재물손괴 | 물건 파손 | 형법 제366조 | 3년↓ / 700만원↓ |

### 3-3. 고소장 표준 양식

```
                        고  소  장

고 소 인
  성    명: {complainant_name} ({birth})
  주    소: {address}
  연 락 처: {phone}

피고소인
  성    명: {suspect_name} (또는 "인적사항 불상")
  주    소: {suspect_address} (또는 "불상")
  연 락 처: {suspect_phone} (또는 "불상")

고소인은 피고소인을 아래와 같은 범죄사실로 고소하오니,
수사하여 엄벌에 처하여 주시기 바랍니다.

                    고 소 취 지
피고소인의 아래 범죄사실에 대하여 처벌하여 주시기 바랍니다.

                    범 죄 사 실
1. 당사자의 관계
   {relationship_description}

2. 범죄사실
   가. {incident_1} (6하원칙: 누가, 언제, 어디서, 무엇을, 어떻게)
   나. {incident_2}
   ...

                    적 용 법 조
{matched_statutes}

                    증 거 자 료
1. 증거 제1호: {evidence_1} [SHA-256: {hash}]
2. 증거 제2호: {evidence_2} [SHA-256: {hash}]
...

                    결    어
위와 같이 고소하오니 엄중히 처벌하여 주시기 바랍니다.

                                    {date}
                                    고소인  {name}  (인)

{police_station} 귀중
```

### 3-4. 변호사법 리스크 대응

| 영역 | 위험도 | 대응 |
|------|:------:|------|
| 고소장 양식 제공 | 낮음 | 허용 |
| 사용자 입력 기반 초안 생성 | 중간 | 법률사무소 청송 직접 운영 구조로 완화 |
| 적용 법조 자동 매칭 | 중간 | "참고용" 명시, 변호사 최종 검토 |
| 구체적 법적 판단/조언 | **높음** | AI 단독 불가, 변호사 필수 |

**필수 면책 고지:**
> "본 문서는 AI가 작성한 초안이며, 법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다."

---

## Phase 4: PDF 출력 엔진

### 4-1. `lib/complaint-pdf.ts` 업데이트 필요

**기존 함수 (구현 완료):**
```typescript
generateComplaintHTML(complaint): string    // 고소장 HTML
createComplaintPDF(html): Promise<string>   // PDF 생성
shareComplaintPDF(fileUri): Promise<void>   // 공유/다운로드
```

**★ 추가할 함수:**
```typescript
// [추가] 경고장/내용증명 HTML 생성
generateWarningLetterHTML(letter: string, type: 'strong' | 'moderate'): string
  → 법률사무소 청송 레터헤드
  → 변호사 김창희 명의 + 직인 위치
  → 내용증명 우편 발송 안내문 포함

// [추가] 연락중지/접근금지 요청서 HTML 생성
generateStopRequestHTML(request: string): string

// [추가] 피해 경위서 HTML 생성 (시간순 타임라인 형태)
generateIncidentTimelineHTML(incidents: CrimeFact[]): string
  → 날짜별 타임라인
  → 각 사건에 매칭되는 증거 번호 표시
  → 대법원 2023도6411 "누적적·포괄적 평가" 근거 시각화
```

### 4-2. 개인정보보호법 준수 설계

- PDF는 **사용자 기기에서만 생성** (서버 전송 없음)
- 피해자가 **다운로드 후 직접 제출** (앱이 경찰에 직접 공유하지 않음)
- 가해자 정보 **마스킹 옵션** 제공 ("김OO", "010-****-5678")
- 생성 전 **민감정보 동의** 필수 (제23조)

---

## Phase 5: UI 컴포넌트

### 5-1. `components/ConsentModal.tsx` — 민감정보 동의 모달
- 일반 개인정보 동의 + 민감정보 **별도 동의** (체크박스 분리)
- 동의 거부 시 불이익 안내 + 진행 불가
- 개인정보보호법 제23조 준거 문구

### 5-2. `components/ComplaintChat.tsx` — 사무장 대화 UI
- 기존 `ai-secretary.tsx` 채팅 패턴 재사용
- 사무장 아바타, 7단계 진행률 표시
- 선택형 질문 → 버튼 카드, 자유입력 → TextInput
- 증거보관함 연동 단계에서 증거 목록 카드 표시

### 5-3. `components/ComplaintPhaseBar.tsx` — 7단계 진행 바
- 현재 단계 하이라이트, 완료 단계 체크마크

### 5-4. `components/ComplaintPreview.tsx` — 고소장 미리보기
- 섹션별 접이식 표시
- 인라인 수정 가능
- 마스킹 토글
- PDF 생성 버튼

---

## Phase 6: 메인 화면 및 통합

### 6-1. `app/complaint.tsx` — 메인 화면 업데이트 필요

**Step 기반 흐름 (★ 서류 선택 단계 추가):**
```
consent → chat → document_select → review → preview → download
   ↓         ↓          ↓             ↓         ↓          ↓
민감정보    사무장    서류 유형       증거선택   서류       PDF
 동의      대화      선택          (보관함)   미리보기   다운로드
```

**★ document_select 단계 (신규):**
사무장 대화 완료 후, 수집된 팩트의 심각도에 따라 대응 단계를 자동 추천하고 서류 유형을 선택:
```
사무장: "말씀해 주신 내용을 분석한 결과, 현재 상황에서는
        [경고장 발송]을 먼저 추천드려요.
        대법원 판례에 따르면 경미한 행위라도 누적되면
        스토킹 범죄에 해당하고, 경고장은 향후 법적 대응의
        결정적 증거가 됩니다.

        어떤 서류를 만들어 드릴까요?

        1. 📋 경고장/내용증명 (행위 중단 요구) — 1단계 추천
        2. 📄 연락중지/접근금지 요청서
        3. 📝 고소장 (형사 고소) — 심각한 경우
        4. 📊 피해 경위서 (증거 정리)
        5. 전부 다 만들어 주세요"
```

### 6-2. 기존 파일 수정

| 파일 | 수정 내용 |
|------|-----------|
| `app/_layout.tsx` | `<Stack.Screen name="complaint">` 등록 |
| `app/(tabs)/index.tsx` | QUICK_ACTIONS에 "고소장 작성" 바로가기 추가 |
| `app/(tabs)/evidence.tsx` | 증거 선택 → "고소장에 포함" 기능 추가 |
| `app/ai-secretary.tsx` | "법적 대응" 선택 시 → 고소장 작성으로 전환 |
| `contexts/AppContext.tsx` | 고소장 세션 상태, 동의 상태 추가 |
| `lib/secure-evidence.ts` | `getEvidenceByIds()`, `getEvidenceForComplaint()` 추가 |

---

## 구현 순서 — 업데이트 반영

### 이미 완료된 작업 (Phase 1~6 초기 구현)

| 파일 | 상태 | 내용 |
|------|:----:|------|
| `types/database.ts` | ✅ | 고소장 타입 14개 |
| `constants/complaint.ts` | ⚠️ **업데이트 필요** | 판례·유형·서류 상수 추가 |
| `constants/consent.ts` | ✅ | 동의 문구 |
| `lib/complaint-secretary.ts` | ⚠️ **업데이트 필요** | 12유형 선별 + 판례 멘트 + 서류 선택 단계 |
| `lib/complaint-generator.ts` | ⚠️ **업데이트 필요** | 경고장/내용증명 생성 + 누적 논증 + 판례 인용 |
| `lib/complaint-pdf.ts` | ⚠️ **업데이트 필요** | 경고장 HTML + 타임라인 HTML |
| `lib/secure-evidence.ts` | ✅ | 증거 연동 함수 |
| `components/ConsentModal.tsx` | ✅ | 동의 모달 |
| `components/ComplaintPhaseBar.tsx` | ✅ | 진행 바 |
| `components/ComplaintChat.tsx` | ⚠️ **업데이트 필요** | 12유형 멀티셀렉트 + 서류 선택 UI |
| `components/ComplaintPreview.tsx` | ⚠️ **업데이트 필요** | 경고장/내용증명 미리보기 지원 |
| `app/complaint.tsx` | ⚠️ **업데이트 필요** | document_select 단계 추가 |
| `app/_layout.tsx` | ✅ | 라우트 등록 |
| `app/(tabs)/index.tsx` | ✅ | 바로가기 추가 |

### 업데이트 작업 순서

| 단계 | 작업 | 상세 |
|:----:|------|------|
| **U1** | `constants/complaint.ts` 업데이트 | 2023도6411 판례, 12유형, 11종 서류, 보호조치, 2024 개정사항 추가 |
| **U2** | `lib/complaint-secretary.ts` 업데이트 | STAGE 4에 12유형 선별 질문 추가, "경미해도 누적=범죄" 판례 멘트, 서류 추천 로직 |
| **U3** | `lib/complaint-generator.ts` 업데이트 | 경고장/내용증명/요청서 생성 함수, 누적 논증 함수, 판례 인용 강화 |
| **U4** | `lib/complaint-pdf.ts` 업데이트 | 경고장 HTML, 타임라인 HTML 추가 |
| **U5** | `components/ComplaintChat.tsx` 업데이트 | 12유형 멀티셀렉트 UI, 서류 선택 카드 |
| **U6** | `app/complaint.tsx` 업데이트 | document_select 단계 추가, 서류 유형별 분기 |
| **U7** | `components/ComplaintPreview.tsx` 업데이트 | 경고장/내용증명 미리보기 |

---

## 핵심 설계 원칙

1. **피해자 안전 최우선** — 모든 단계에서 안전 상태 재확인, 긴급 시 즉시 112 연계
2. **자율성 보장** — 모든 질문에 "건너뛰기" 옵션, 세션 중단/재개 가능
3. **감정 우선** — 법적 팩트 수집보다 피해자 감정 안정이 우선
4. **쉬운 언어** — 법률 용어를 반드시 일상어로 변환
5. **자기비난 즉각 차단** — "내 잘못" 감지 시 교정
6. **로컬 우선** — 모든 데이터 기기 내 저장, 서버 전송 없음
7. **변호사 운영 구조** — 법률사무소 청송이 직접 운영, 변호사법 위반 리스크 없음
8. **판례 기반 설계** — 대법원 2023도6411의 "누적적·포괄적 평가" 원칙을 앱의 핵심 가치로 반영
9. **4단계 대응 전략** — 경고장(1단계) → 신고(2단계) → 고소(3단계) → 처벌(4단계) 순차 대응
10. **경미해도 기록** — "이 정도는 아닌 것 같다"는 피해자를 판례로 설득하여 빠짐없이 기록

---

---

## Phase 8: 전체 앱 감사 — 확정된 수정 사항

> 4개 감사팀 결과 + 우철님 의사결정 반영 (2026-03-28)

### 8-1. CRITICAL — 즉시 수정

#### [C1] 암호화 실제 구현 — ✅ 확정: 지금 바로 구현
- **파일:** `lib/secure-evidence.ts` 라인 36-71, `lib/encryption.ts` 전체
- **현황:** 15곳에서 "AES-256 암호화" 표시하지만 실제는 Base64. 동의서에도 허위 기재.
- **수정 내용:**
  - `expo-crypto`의 `digestStringAsync`로 **실제 SHA-256** 구현
  - `expo-secure-store`로 암호화 키 관리
  - **AES-256-GCM 실제 암호화** 구현
  - 민감 데이터 AsyncStorage → SecureStore 전환
  - `lib/encryption.ts` 삭제 (passthrough 함수, 미사용)

#### [C2] 민감정보 동의 — 카테고리별 1회 동의 — ✅ 확정
- **수정 내용:** 2개 카테고리로 분리, 각 첫 사용 시 1회 동의
  - **"진단 관련" 동의**: diagnosis, danger-assessment, gaslighting-test, self-assessment
  - **"증거/기록 관련" 동의**: evidence, stalking-log, gaslighting-journal, ai-secretary
- **구현:** AsyncStorage에 `@consent_diagnosis`, `@consent_evidence` 플래그 저장
- **동의 UI:** `components/ConsentModal.tsx` 재활용 (현재 미사용 → 정본으로 활용)

#### [C3] Supabase 미설정
- **파일:** `lib/supabase.ts` 라인 6-8
- **현황:** `'https://your-project.supabase.co'` (플레이스홀더)
- **수정:** 실제 프로젝트 정보 입력 또는 Supabase 미사용 시 관련 코드 제거

### 8-2. 높음 — 유저 플로우 혼란 수정

#### [H1] "법률 경고장" — 별도 유료 서비스로 유지 — ✅ 확정
- **결정:** 변호사 명의 경고장/내용증명 발송하는 **별도 유료 서비스**
- **수정:** `route: '/legal-info'` → `route: '/letter'`로 변경 (기존 letter.tsx가 경고장 발송 화면)
- **가격:** 이메일/SNS 경고장 49,000원 / 내용증명 우편 99,000원

#### [H2] 진단 기능 — 각각 다른 도구로 유지
- diagnosis(10문항), danger-assessment(20문항), gaslighting-test(15문항)는 별도 도구
- 홈에서 차이점 desc 문구 명확화 필요

#### [H3] 메인 CTA — 향후 검토
#### [H4] 이중 경로 — Phase 7 통합 시 해결

### 8-3. 높음 — 법률 앱 신뢰성 문제

#### [L1] "검토: 김창희 변호사" — 현행 유지 — ✅ 확정
- **결정:** 법률사무소 청송이 직접 운영하는 앱. 하드코딩 응답도 변호사가 작성/검토한 것.
- **조건:** 향후 AI API 연동 시 "AI 생성 답변 (변호사 감수 법률정보 기반)"으로 문구 교체 검토

#### [L2] 면책 고지 — 홈 상단 고정 배너 — ✅ 확정
- **수정:** 홈화면 상단에 고정 배너 추가 "법률사무소 청송 제공 법률정보 서비스"
- **파일:** `app/(tabs)/index.tsx` 헤더 아래 또는 히어로 위

#### [L3] 유료/무료 구분 — 구독 화면 비교표 추가

### 8-4. CRITICAL — 긴급 상황 대응 — ✅ 확정

#### [E1] 위기 키워드 감지 시 SOSModal 강제 표시
- **현황:** 3개 대화 화면 모두 텍스트 응답만, SOS 모달 안 뜸
- **수정 내용:**
  - `lib/legal-chatbot.ts` — `generateResponse` 반환값에 `{ isEmergency: boolean }` 추가
  - `app/(tabs)/legal-info.tsx` — `isEmergency` 시 SOSModal **강제 표시**
  - `app/ai-secretary.tsx` — crisis 배너를 SOSModal로 교체
  - `components/ComplaintChat.tsx` — 위기 감지 시 SOSModal 연동
  - `components/SOSModal.tsx` — 1393(자살예방상담) 연락처 추가

### 8-5. 코드 정리 — ✅ 확정

#### [T1] 컴포넌트 파일을 정본으로 — ✅ 확정
- `components/ComplaintChat.tsx`, `ComplaintPreview.tsx`, `ComplaintPhaseBar.tsx`를 정본으로 유지
- `app/complaint.tsx` 내부 인라인 구현 → 컴포넌트 import로 교체

#### [T2] 미사용 파일 전부 삭제 — ✅ 확정 (13개)

| 삭제 파일 | 이유 |
|-----------|------|
| `components/haptic-tab.tsx` | Expo 보일러플레이트 |
| `components/hello-wave.tsx` | Expo 보일러플레이트 |
| `components/LawyerReviewBadge.tsx` | 미사용 |
| `components/themed-text.tsx` | explore 의존 체인 |
| `components/themed-view.tsx` | explore 의존 체인 |
| `components/parallax-scroll-view.tsx` | explore 의존 체인 |
| `components/ui/collapsible.tsx` | explore 의존 체인 |
| `components/ui/icon-symbol.tsx` | explore 의존 체인 |
| `components/ui/icon-symbol.ios.tsx` | explore 의존 체인 |
| `lib/encryption.ts` | passthrough, 미사용 |
| `constants/index.ts` | barrel export, 소비자 없음 |
| `app/(tabs)/explore.tsx` | Expo 템플릿 잔재 |
| `app/modal.tsx` | 접근 경로 없음 |

- `app/(tabs)/_layout.tsx` explore 탭 hidden 코드도 삭제

#### [T3] 접근 불가 화면 유지 (향후 사용)
- `app/onboarding.tsx` — 온보딩 구현 시 사용
- `app/security-partner.tsx` — ADT캡스 제휴 시 사용

#### [T4] 하드코딩 정보 정리
- `my-page.tsx`: "02-XXX-XXXX" → 실제 번호 또는 제거

### 8-6. 최종 수정 우선순위 — ✅ 확정

```
[1순위] C1 — 암호화 실제 구현 (출시 차단)
  ↓
[2순위] E1 — 위기 키워드 SOS 강제 표시 (안전 최우선)
  ↓
[3순위] C2 — 카테고리별 동의 절차 구현
  ↓
[4순위] T2 — 미사용 파일 13개 삭제
  ↓
[5순위] T1 — complaint.tsx 컴포넌트 분리 (import 교체)
  ↓
[6순위] H1 — "법률 경고장" 링크 → /letter
  ↓
[7순위] L2 — 홈 상단 면책 배너 추가
  ↓
[8순위] Phase 7 — 통합 리팩토링 (R1~R10)
```

---

## 긴급 연락처 (대화 중 안내용)

| 기관 | 번호 | 용도 |
|------|------|------|
| 경찰 | 112 | 긴급 신고 |
| 여성긴급전화 | 1366 | 가정폭력/성폭력 상담 (24시간) |
| 해바라기센터 | 1899-3075 | 성폭력 통합지원 |
| 자살예방상담 | 1393 | 위기 상담 (24시간) |
| 정신건강위기 | 1577-0199 | 정신건강 상담 |
| D4U센터 | 02-735-8994 | 불법촬영물 삭제 지원 |
| 법률구조공단 | 132 | 무료 법률 상담 |

---

## Phase 7: 통합 리팩토링 — 중복 제거 및 흐름 일원화

### 7-1. 현재 문제 — 4개 화면이 겹치는 기능을 각각 구현

```
현재 구조 (중복 심각):

[police-report.tsx]  ─── 사실관계 수집 (폼) + 법률분석 + PDF (미구현)
[complaint.tsx]      ─── 사실관계 수집 (챗봇) + 법률분석 + PDF (구현완료)
[ai-secretary.tsx]   ─── 사실관계 수집 (챗봇) + 경고장 생성
[evidence-forensics] ─── 증거 관리 + 법정 제출 내보내기
```

| 겹치는 기능 | 관련 화면 | 문제 |
|-------------|-----------|------|
| **사실관계 수집** | police-report, complaint, ai-secretary | 3가지 다른 UI로 같은 정보 수집 |
| **법률 분석** | police-report, complaint, ai-secretary, legal-info | 4개 화면이 각각 다른 법률 데이터 사용 |
| **PDF 생성** | police-report(미구현), complaint, evidence-forensics | 목적 겹침 |
| **증거 저장소** | (tabs)/evidence, evidence-forensics | 2개 저장소 존재 (MOCK vs 실제) |

### 7-2. 통합 목표 구조

```
통합 후:

[complaint.tsx] ─── 통합 법률 서류 허브
  ├── 사무장 대화 (7단계 사실관계 수집) ← ai-secretary 흡수
  ├── 서류 선택 (고소장/경고장/내용증명/보고서) ← police-report 흡수
  ├── 법률 분석 (중앙 법률 지식 베이스)
  ├── PDF 생성 (모든 서류 유형)
  └── 증거 연동 (SecureEvidence API 단일 소스)

[(tabs)/legal-info.tsx] ─── 법률 정보 챗봇 (교육 목적, 서류 생성 X) → 유지
[(tabs)/evidence.tsx]   ─── 증거 저장소 (단일) → 유지
```

### 7-3. 삭제/통합 대상 파일

| 파일 | 조치 | 이유 |
|------|:----:|------|
| **`app/police-report.tsx`** | **삭제** | complaint.tsx의 "증거 분석 보고서" 서류 유형으로 흡수 |
| **`constants/police-report.ts`** | **삭제** | `complaint-generator.ts`로 로직 이전 |
| **`app/evidence-forensics.tsx`** | **삭제** | (tabs)/evidence.tsx로 통합 |
| **`app/ai-secretary.tsx`** | **축소** | 일반 상담만 유지, 경고장 생성은 complaint.tsx로 이전 |
| **`lib/ai-secretary.ts`** | **축소** | 일반 상담 엔진만 유지 |
| **`constants/letter-templates.ts`** | **이전** | complaint-generator.ts에 경고장 템플릿 통합 |

### 7-4. complaint.tsx 서류 선택 확장

사무장 대화 완료 후 생성 가능한 서류:

| 서류 유형 | 원래 담당 화면 | 통합 후 |
|-----------|:-----------:|:------:|
| **고소장** | complaint.tsx | complaint.tsx |
| **경고장/내용증명** | ai-secretary.tsx (Option A) | complaint.tsx |
| **연락중지 요청서** | 없음 (신규) | complaint.tsx |
| **접근금지 요청서** | 없음 (신규) | complaint.tsx |
| **증거 분석 보고서** | police-report.tsx | complaint.tsx |
| **피해 경위서** | 없음 (신규) | complaint.tsx |
| **사건 기록 일지** | 없음 (신규) | complaint.tsx |
| **증거 목록 정리표** | evidence-forensics.tsx | complaint.tsx |
| **잠정조치 청구 요청서** | 없음 (신규) | complaint.tsx |
| **접근금지 가처분 신청서** | 없음 (신규) | complaint.tsx |
| **진술서 초안** | 없음 (신규) | complaint.tsx |

### 7-5. 법률 지식 베이스 중앙화

현재 4곳에 분산된 법률 데이터를 통합:

| 현재 위치 | 데이터 | 통합 위치 |
|-----------|--------|:---------:|
| `constants/police-report.ts` → `analyzeEvidence()` | 증거→법률 매칭 | `constants/complaint.ts` |
| `lib/legal-chatbot.ts` → `LEGAL_KNOWLEDGE` | 키워드→법률 지식 | `constants/complaint.ts` |
| `lib/complaint-generator.ts` → `STATUTE_TABLE` | 범죄→법조 매칭 | `constants/complaint.ts` |
| `lib/ai-secretary.ts` → Mock 응답 | 단계별 법률 안내 | `constants/complaint.ts` |

**`constants/complaint.ts`의 `APPLICABLE_STATUTES`를 마스터 법률 DB로 확장:**
- 모든 화면이 이 단일 소스에서 법률 데이터를 import
- 판례 데이터(2023도6411 등)도 여기에 통합

### 7-6. 라우팅 정리

| 변경 전 | 변경 후 |
|---------|---------|
| 홈 → "고소장 작성" → `/complaint` | 유지 |
| 홈 → "증거 분석 보고서" → `/police-report` | 홈 → `/complaint` (서류 선택에서 "보고서" 선택) |
| AI 사무장 → Option A → 경고장 | AI 사무장 → Option A → `/complaint` (서류 선택에서 "경고장" 선택) |
| 증거함 → 법정 제출 → `/evidence-forensics` | 증거함 → "서류 만들기" → `/complaint` |

### 7-7. 통합 작업 순서

| 단계 | 작업 | 의존성 |
|:----:|------|:------:|
| **R1** | `constants/complaint.ts`에 법률 지식 베이스 통합 | 없음 |
| **R2** | `complaint-generator.ts`에 경고장/보고서 생성 로직 추가 | R1 |
| **R3** | `complaint-pdf.ts`에 경고장/보고서 HTML 추가 | R2 |
| **R4** | `complaint.tsx` document_select 단계에 전체 11종 서류 옵션 | R2, R3 |
| **R5** | `ai-secretary.tsx` Option A → `/complaint` 리다이렉트 | R4 |
| **R6** | `(tabs)/evidence.tsx`에 "서류 만들기" 버튼 → `/complaint` | R4 |
| **R7** | `police-report.tsx` 삭제 + 라우팅 정리 | R4 |
| **R8** | `evidence-forensics.tsx` 삭제 + 라우팅 정리 | R6 |
| **R9** | `constants/police-report.ts`, `constants/letter-templates.ts` 삭제 | R2 |
| **R10** | `_layout.tsx`에서 삭제된 라우트 제거 | R7, R8 |

### 7-8. 통합 후 최종 앱 구조

```
앱 구조 (통합 후):

[홈]
  ├── 위험도 자가진단 → /diagnosis
  ├── AI 사무장 상담 → /ai-secretary (일반 상담만, 서류 생성 시 /complaint로 이동)
  ├── 고소장/서류 작성 → /complaint (통합 허브: 11종 서류)
  └── SOS 긴급 → SOSModal

[증거함 탭]
  ├── 증거 추가 (사진/녹음/텍스트/파일)
  ├── 증거 타임라인
  └── "서류 만들기" → /complaint

[법률정보 탭]
  └── AI 법률 챗봇 (교육 목적, 서류 생성 X)

[내 보호 탭]
  └── 안전 설정, 은밀모드 등
```

### 7-9. 통합으로 인한 효과

| 항목 | Before | After |
|------|:------:|:-----:|
| 서류 생성 화면 수 | 4개 | **1개** (complaint.tsx) |
| 법률 데이터 소스 | 4곳 분산 | **1곳** (complaint.ts) |
| 증거 저장소 | 2개 (MOCK + 실제) | **1개** (SecureEvidence) |
| PDF 엔진 | 2개 (미구현 + 구현) | **1개** (complaint-pdf.ts) |
| 삭제되는 파일 | — | 4~5개 |
| 사용자 혼란 | "어디서 뭘 해야 하지?" | "서류는 전부 여기서" |
