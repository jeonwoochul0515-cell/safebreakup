import React, { useState } from 'react';

type EvidenceStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

interface EvidenceItem {
  id: string;
  userName: string;
  type: string;
  category: string;
  itemCount: number;
  status: EvidenceStatus;
  requestDate: string;
  sha256: string;
}

const STATUS_CONFIG: Record<EvidenceStatus, { label: string; color: string }> = {
  pending: { label: '검토대기', color: '#E09F3E' },
  reviewing: { label: '검토중', color: '#4A90D9' },
  approved: { label: '승인', color: '#6B9080' },
  rejected: { label: '반려', color: '#E07A5F' },
};

const MOCK_EVIDENCE: EvidenceItem[] = [
  { id: 'ev1', userName: '김**', type: '카카오톡 캡처', category: '스토킹', itemCount: 12, status: 'pending', requestDate: '2026-03-27', sha256: 'a3f2...8e1d' },
  { id: 'ev2', userName: '이**', type: '통화 녹음', category: '협박', itemCount: 3, status: 'reviewing', requestDate: '2026-03-26', sha256: 'b7c1...4f2a' },
  { id: 'ev3', userName: '박**', type: 'CCTV 영상', category: '미행/추적', itemCount: 2, status: 'approved', requestDate: '2026-03-25', sha256: 'c9d4...6b3e' },
  { id: 'ev4', userName: '최**', type: '문자 메시지', category: '데이트폭력', itemCount: 28, status: 'rejected', requestDate: '2026-03-24', sha256: 'd2e5...9a7c' },
  { id: 'ev5', userName: '정**', type: 'SNS 스크린샷', category: '디지털 성범죄', itemCount: 8, status: 'pending', requestDate: '2026-03-27', sha256: 'e6f8...1d4b' },
  { id: 'ev6', userName: '한**', type: '이메일', category: '스토킹', itemCount: 5, status: 'pending', requestDate: '2026-03-26', sha256: 'f1a3...7c2e' },
];

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '검토대기' },
  { key: 'reviewing', label: '검토중' },
  { key: 'approved', label: '승인' },
  { key: 'rejected', label: '반려' },
];

export default function Evidence() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [evidence, setEvidence] = useState<EvidenceItem[]>(MOCK_EVIDENCE);

  const filtered = activeFilter === 'all' ? evidence : evidence.filter((e) => e.status === activeFilter);
  const pendingCount = evidence.filter((e) => e.status === 'pending').length;
  const reviewedCount = evidence.filter((e) => e.status === 'approved' || e.status === 'rejected').length;

  const updateStatus = (id: string, newStatus: EvidenceStatus) => {
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  const handleAction = (item: EvidenceItem, action: EvidenceStatus) => {
    const labels: Record<string, string> = { reviewing: '검토 시작', approved: '승인', rejected: '반려' };
    if (window.confirm(`${item.userName}님의 증거를 "${labels[action]}" 처리하시겠습니까?`)) {
      updateStatus(item.id, action);
    }
  };

  return (
    <div>
      <h2 className="page-title">증거 검토 관리</h2>

      <div className="info-banner" style={{ background: '#6B908015', borderLeft: '3px solid #6B9080', padding: '12px 16px', borderRadius: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🛡️</span>
        <span>SHA-256 해시 무결성 검증된 증거만 승인 가능합니다</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">검토 대기</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{reviewedCount}</div>
          <div className="stat-label">검토 완료</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{evidence.length}</div>
          <div className="stat-label">전체 요청</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => {
          const count = tab.key === 'all' ? evidence.length : evidence.filter((e) => e.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                background: activeFilter === tab.key ? '#2D2B3D' : '#fff',
                color: activeFilter === tab.key ? '#fff' : '#666',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Evidence Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>유형</th>
            <th>카테고리</th>
            <th>증거 수</th>
            <th>SHA-256</th>
            <th>요청일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            return (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.userName}</td>
                <td>{item.type}</td>
                <td>{item.category}</td>
                <td>{item.itemCount}건</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.sha256}</td>
                <td>{item.requestDate}</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: cfg.color + '20',
                    color: cfg.color,
                  }}>
                    {cfg.label}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {item.status === 'pending' && (
                      <button className="btn-sm btn-outline" onClick={() => handleAction(item, 'reviewing')}>검토 시작</button>
                    )}
                    {(item.status === 'pending' || item.status === 'reviewing') && (
                      <>
                        <button className="btn-sm btn-success" onClick={() => handleAction(item, 'approved')}>승인</button>
                        <button className="btn-sm btn-danger" onClick={() => handleAction(item, 'rejected')}>반려</button>
                      </>
                    )}
                    {(item.status === 'approved' || item.status === 'rejected') && (
                      <span style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                        {item.status === 'approved' ? '승인 완료' : '반려 완료'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>해당 상태의 증거가 없습니다</div>
      )}
    </div>
  );
}
