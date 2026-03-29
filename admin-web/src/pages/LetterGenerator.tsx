import React, { useState } from 'react';

type LetterStatus = 'draft_ready' | 'lawyer_review' | 'approved' | 'sent';

const STATUS_CONFIG: Record<LetterStatus, { label: string; color: string }> = {
  draft_ready: { label: '초안 작성', color: '#E09F3E' },
  lawyer_review: { label: '변호사 검토', color: '#4A90D9' },
  approved: { label: '승인', color: '#6B9080' },
  sent: { label: '발송 완료', color: '#7B68EE' },
};

interface LetterCase {
  id: string;
  clientName: string;
  recipientName: string;
  relationship: string;
  breakupDate: string;
  status: LetterStatus;
  harassmentTypes: string[];
  demands: string[];
  createdAt: string;
}

const MOCK_LETTERS: LetterCase[] = [
  {
    id: 'lt1',
    clientName: '김**',
    recipientName: '이**',
    relationship: '전 연인',
    breakupDate: '2026-02-15',
    status: 'draft_ready',
    harassmentTypes: ['반복적인 전화/문자', '미행/추적/감시', '주거지/직장 방문'],
    demands: ['일체의 연락 중단', '주거지/직장 접근 금지'],
    createdAt: '2026-03-27',
  },
  {
    id: 'lt2',
    clientName: '박**',
    recipientName: '최**',
    relationship: '전 배우자',
    breakupDate: '2026-01-10',
    status: 'lawyer_review',
    harassmentTypes: ['협박/위협적 언행', '사진/영상 유포 협박'],
    demands: ['일체의 연락 중단', 'SNS 접촉 중단', '유포물 즉시 삭제'],
    createdAt: '2026-03-26',
  },
  {
    id: 'lt3',
    clientName: '정**',
    recipientName: '한**',
    relationship: '전 연인',
    breakupDate: '2026-03-01',
    status: 'approved',
    harassmentTypes: ['반복적인 전화/문자'],
    demands: ['일체의 연락 중단'],
    createdAt: '2026-03-25',
  },
  {
    id: 'lt4',
    clientName: '이**',
    recipientName: '강**',
    relationship: '전 동거인',
    breakupDate: '2025-12-20',
    status: 'sent',
    harassmentTypes: ['미행/추적/감시', '협박/위협적 언행', '자해/자살 협박'],
    demands: ['일체의 연락 중단', '주거지/직장 접근 금지', 'SNS 접촉 중단'],
    createdAt: '2026-03-20',
  },
];

function getRiskLevel(types: string[]): { label: string; color: string } {
  const highRisk = ['협박/위협적 언행', '폭행/신체적 폭력', '자해/자살 협박', '사진/영상 유포 협박'];
  const highCount = types.filter((t) => highRisk.includes(t)).length;
  if (highCount >= 2 || types.length >= 5) return { label: '위험 (높음)', color: '#E07A5F' };
  if (highCount >= 1 || types.length >= 3) return { label: '주의 (중간)', color: '#E09F3E' };
  return { label: '관찰 (낮음)', color: '#6B9080' };
}

export default function LetterGenerator() {
  const [letters, setLetters] = useState<LetterCase[]>(MOCK_LETTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [content, setContent] = useState('');

  const STATUS_STEPS: LetterStatus[] = ['draft_ready', 'lawyer_review', 'approved', 'sent'];

  const handleStatusChange = (id: string, newStatus: LetterStatus) => {
    const label = STATUS_CONFIG[newStatus].label;
    if (window.confirm(`상태를 "${label}"(으)로 변경하시겠습니까?`)) {
      setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    }
  };

  const handleCreateNew = () => {
    if (!senderName || !recipientName || !content) {
      window.alert('발신인, 수신인, 내용을 모두 입력해주세요.');
      return;
    }
    window.alert('경고장 초안이 생성되었습니다. (Mock)');
    setSenderName('');
    setRecipientName('');
    setContent('');
  };

  return (
    <div>
      <h2 className="page-title">경고장 생성기</h2>

      {/* New Letter Form */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>새 경고장 작성</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>발신인 (의뢰인)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="이름 입력"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>수신인 (상대방)</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="이름 입력"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>경고장 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="경고장 내용을 입력하세요..."
            rows={6}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }}
          />
        </div>
        <button className="btn-sm btn-primary" style={{ padding: '8px 24px', fontSize: 14 }} onClick={handleCreateNew}>
          초안 생성
        </button>
      </div>

      {/* Existing Letters */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>경고장 목록</h3>

      {letters.map((letter) => {
        const risk = getRiskLevel(letter.harassmentTypes);
        const currentIdx = STATUS_STEPS.indexOf(letter.status);
        const isExpanded = selectedId === letter.id;

        return (
          <div
            key={letter.id}
            style={{ background: '#fff', borderRadius: 10, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}
          >
            <div
              onClick={() => setSelectedId(isExpanded ? null : letter.id)}
              style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
            >
              {/* Status Flow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                {STATUS_STEPS.map((step, idx) => {
                  const cfg = STATUS_CONFIG[step];
                  const isActive = idx <= currentIdx;
                  return (
                    <React.Fragment key={step}>
                      {idx > 0 && <div style={{ flex: 1, height: 2, background: isActive ? cfg.color : '#eee' }} />}
                      <div style={{
                        width: 24, height: 24, borderRadius: 12,
                        background: isActive ? cfg.color : '#eee',
                        color: isActive ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {idx + 1}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#999', marginBottom: 4 }}>
                {STATUS_STEPS.map((step) => (
                  <span key={step} style={{ flex: 1, textAlign: 'center' }}>{STATUS_CONFIG[step].label}</span>
                ))}
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div>
                  <strong>{letter.clientName}</strong>
                  <span style={{ color: '#999', margin: '0 8px' }}>→</span>
                  <strong>{letter.recipientName}</strong>
                  <span style={{ color: '#999', marginLeft: 12, fontSize: 13 }}>{letter.relationship}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: risk.color + '20', color: risk.color }}>
                    {risk.label}
                  </span>
                  <span style={{ fontSize: 18, color: '#999' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid #eee', padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div><span style={{ color: '#999', fontSize: 13 }}>이별일:</span> <strong>{letter.breakupDate}</strong></div>
                  <div><span style={{ color: '#999', fontSize: 13 }}>생성일:</span> <strong>{letter.createdAt}</strong></div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>피해 유형</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {letter.harassmentTypes.map((type) => (
                      <span key={type} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: '#E07A5F15', color: '#E07A5F', fontWeight: 600 }}>{type}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>요구사항</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {letter.demands.map((d) => (
                      <span key={d} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: '#4A90D915', color: '#4A90D9', fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {letter.status === 'draft_ready' && (
                    <button className="btn-sm btn-primary" onClick={() => handleStatusChange(letter.id, 'lawyer_review')}>변호사 검토 요청</button>
                  )}
                  {letter.status === 'lawyer_review' && (
                    <>
                      <button className="btn-sm btn-success" onClick={() => handleStatusChange(letter.id, 'approved')}>승인</button>
                      <button className="btn-sm btn-danger" onClick={() => handleStatusChange(letter.id, 'draft_ready')}>수정 요청</button>
                    </>
                  )}
                  {letter.status === 'approved' && (
                    <button className="btn-sm btn-primary" onClick={() => handleStatusChange(letter.id, 'sent')}>발송</button>
                  )}
                  {letter.status === 'sent' && (
                    <span style={{ fontSize: 13, color: '#6B9080', fontWeight: 600 }}>발송 완료</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
