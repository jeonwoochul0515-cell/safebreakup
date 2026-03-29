import React, { useState } from 'react';

interface ContentItem {
  name: string;
  sub?: string;
  actions: string[];
}

interface ContentSection {
  key: string;
  title: string;
  icon: string;
  items: ContentItem[];
}

const CONTENT_SECTIONS: ContentSection[] = [
  {
    key: 'legal',
    title: '법률 정보 관리',
    icon: '📖',
    items: [
      { name: '스토킹처벌법 해설', sub: '2026.02 개정 반영', actions: ['수정'] },
      { name: '성폭력처벌법 안내', sub: '피해자 권리 중심', actions: ['수정'] },
      { name: '가정폭력방지법 가이드', sub: '보호명령 절차 포함', actions: ['수정'] },
      { name: '디지털 성범죄 대응법', sub: 'NCII/딥페이크 포함', actions: ['수정'] },
      { name: '데이트폭력 법적 대응', sub: '접근금지 가처분', actions: ['수정'] },
      { name: '경제적 학대 관련 법률', sub: '재산분할/부당이득', actions: ['수정'] },
    ],
  },
  {
    key: 'faq',
    title: 'FAQ 관리',
    icon: '❓',
    items: [
      { name: '경고장은 법적 효력이 있나요?', actions: ['수정', '삭제'] },
      { name: '스토킹 증거는 어떻게 수집하나요?', actions: ['수정', '삭제'] },
      { name: '접근금지 가처분 신청 방법', actions: ['수정', '삭제'] },
      { name: '경호 서비스 이용 절차', actions: ['수정', '삭제'] },
      { name: '증거 PDF는 법정에서 인정되나요?', actions: ['수정', '삭제'] },
      { name: '무료/라이트/케어 차이점', actions: ['수정', '삭제'] },
      { name: '개인정보 보호 정책', actions: ['수정', '삭제'] },
    ],
  },
  {
    key: 'therapist',
    title: '상담사 디렉토리',
    icon: '👥',
    items: [
      { name: '김수연 상담사', sub: '트라우마 전문 / EMDR', actions: ['수정', '삭제'] },
      { name: '이지현 상담사', sub: '가스라이팅 회복 전문', actions: ['수정', '삭제'] },
      { name: '박민서 상담사', sub: '데이트폭력 피해 상담', actions: ['수정', '삭제'] },
      { name: '최유진 상담사', sub: '디지털 성범죄 피해 지원', actions: ['수정', '삭제'] },
      { name: '정하은 상담사', sub: '이별 후 심리 회복', actions: ['수정', '삭제'] },
    ],
  },
  {
    key: 'safePlaces',
    title: '안전장소',
    icon: '📍',
    items: [
      { name: '서울 여성긴급전화 1366', sub: '24시간 운영', actions: ['추가', '수정'] },
      { name: '한국여성의전화 상담소', sub: '서울 마포구', actions: ['추가', '수정'] },
      { name: '해바라기센터 (서울)', sub: '성폭력 원스톱 지원', actions: ['추가', '수정'] },
      { name: '여성긴급피난처 (비공개)', sub: '위치 비공개', actions: ['추가', '수정'] },
      { name: '디지털성범죄피해자지원센터', sub: '여성가족부', actions: ['추가', '수정'] },
    ],
  },
  {
    key: 'escort',
    title: '경호 서비스 플랜',
    icon: '🛡️',
    items: [
      { name: '안전동행 플랜', sub: '150,000원 / 2시간', actions: ['가격 수정'] },
      { name: '완전보호 플랜', sub: '350,000원 / 4시간', actions: ['가격 수정'] },
      { name: '이사보호 플랜', sub: '500,000원 / 8시간', actions: ['가격 수정'] },
      { name: '긴급출동 플랜', sub: '200,000원 / 즉시', actions: ['가격 수정'] },
    ],
  },
];

export default function Content() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['legal']));
  const [activeTab, setActiveTab] = useState('legal');

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAction = (action: string, itemName: string) => {
    window.alert(`"${itemName}" 항목을 ${action}하시겠습니까?\n\n이 기능은 추후 구현됩니다.`);
  };

  return (
    <div>
      <h2 className="page-title">콘텐츠 관리</h2>

      <div style={{ background: '#E09F3E15', borderLeft: '3px solid #E09F3E', padding: '12px 16px', borderRadius: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⚠️</span>
        <strong>콘텐츠 변경 시 김창희 변호사 검토 필요</strong>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CONTENT_SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => { setActiveTab(section.key); setExpandedSections(new Set([section.key])); }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              background: activeTab === section.key ? '#2D2B3D' : '#fff',
              color: activeTab === section.key ? '#fff' : '#666',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{section.icon}</span>
            {section.title}
            <span style={{
              background: activeTab === section.key ? 'rgba(255,255,255,0.2)' : '#2D2B3D',
              color: '#fff',
              borderRadius: 10,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 700,
            }}>
              {section.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {CONTENT_SECTIONS.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        return (
          <div key={section.key} style={{ background: '#fff', borderRadius: 10, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div
              onClick={() => toggleSection(section.key)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{section.icon}</span>
                <strong>{section.title}</strong>
                <span style={{ background: '#2D2B3D', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{section.items.length}</span>
              </div>
              <span style={{ fontSize: 18, color: '#999' }}>{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid #eee' }}>
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 20px',
                      borderBottom: idx < section.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      {item.sub && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.sub}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction(action, item.name)}
                          className={action === '삭제' ? 'btn-sm btn-danger' : 'btn-sm btn-outline'}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
