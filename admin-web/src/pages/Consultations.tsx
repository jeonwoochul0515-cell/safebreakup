import React, { useState } from 'react';

type ConsultationStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface Consultation {
  id: string;
  userName: string;
  type: string;
  status: ConsultationStatus;
  date: string;
  time: string;
  method: string;
  phone: string;
  notes: string;
}

const STATUS_CONFIG: Record<ConsultationStatus, { label: string; color: string }> = {
  pending: { label: '대기', color: '#E09F3E' },
  confirmed: { label: '확정', color: '#4A90D9' },
  in_progress: { label: '진행중', color: '#7B68EE' },
  completed: { label: '완료', color: '#6B9080' },
  cancelled: { label: '취소', color: '#999' },
};

const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'c1', userName: '김**', type: '법률상담', status: 'pending', date: '2026-03-28', time: '14:00', method: '화상', phone: '010-****-1234', notes: '스토킹 피해 관련 접근금지 가처분 상담' },
  { id: 'c2', userName: '이**', type: '심리상담', status: 'confirmed', date: '2026-03-28', time: '16:00', method: '전화', phone: '010-****-5678', notes: '가스라이팅 회복 프로그램 초기 상담' },
  { id: 'c3', userName: '박**', type: '법률상담', status: 'in_progress', date: '2026-03-27', time: '10:00', method: '대면', phone: '010-****-9012', notes: '디지털 성범죄 증거 보전 및 고소장 작성' },
  { id: 'c4', userName: '최**', type: '경호상담', status: 'completed', date: '2026-03-26', time: '11:00', method: '전화', phone: '010-****-3456', notes: '이사 보호 서비스 사전 미팅' },
  { id: 'c5', userName: '정**', type: '법률상담', status: 'pending', date: '2026-03-29', time: '15:00', method: '화상', phone: '010-****-7890', notes: '데이트폭력 피해 신고 절차 안내' },
  { id: 'c6', userName: '한**', type: '심리상담', status: 'pending', date: '2026-03-29', time: '13:00', method: '전화', phone: '010-****-2345', notes: '이별 후 트라우마 EMDR 상담' },
];

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기' },
  { key: 'confirmed', label: '확정' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
];

export default function Consultations() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);

  const filtered = activeFilter === 'all' ? consultations : consultations.filter((c) => c.status === activeFilter);
  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const todayCount = consultations.filter((c) => c.date === '2026-03-27').length;

  const handleAction = (id: string, action: ConsultationStatus) => {
    const labels: Record<string, string> = { confirmed: '확정', completed: '완료', cancelled: '취소' };
    if (window.confirm(`이 상담을 "${labels[action]}" 처리하시겠습니까?`)) {
      setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status: action } : c)));
    }
  };

  return (
    <div>
      <h2 className="page-title">상담 관리</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">대기 중</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayCount}</div>
          <div className="stat-label">오늘 예정</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{consultations.length}</div>
          <div className="stat-label">전체</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => (
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consultations Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>유형</th>
            <th>일시</th>
            <th>방법</th>
            <th>메모</th>
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
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    background: '#2D2B3D',
                    color: '#fff',
                  }}>
                    {item.type}
                  </span>
                </td>
                <td>{item.date} {item.time}</td>
                <td>{item.method}</td>
                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notes}</td>
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
                      <button className="btn-sm btn-primary" onClick={() => handleAction(item.id, 'confirmed')}>확정</button>
                    )}
                    {(item.status === 'pending' || item.status === 'confirmed' || item.status === 'in_progress') && (
                      <button className="btn-sm btn-success" onClick={() => handleAction(item.id, 'completed')}>완료</button>
                    )}
                    {item.status !== 'completed' && item.status !== 'cancelled' && (
                      <button className="btn-sm btn-danger" onClick={() => handleAction(item.id, 'cancelled')}>취소</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>해당 상태의 상담이 없습니다</div>
      )}
    </div>
  );
}
