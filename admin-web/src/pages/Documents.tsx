import React, { useState } from 'react';
// TODO: Firestore 연동
// import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockDocuments = [
  { id: 'd1', type: '고소장', userId: 'user1@test.com', status: '완료', createdAt: '2026-03-27' },
  { id: 'd2', type: '경고장', userId: 'user2@test.com', status: '완료', createdAt: '2026-03-26' },
  { id: 'd3', type: '내용증명', userId: 'user3@test.com', status: '검토중', createdAt: '2026-03-25' },
  { id: 'd4', type: '요청서', userId: 'user1@test.com', status: '초안', createdAt: '2026-03-25' },
  { id: 'd5', type: '고소장', userId: 'user5@test.com', status: '완료', createdAt: '2026-03-24' },
  { id: 'd6', type: '경고장', userId: 'user4@test.com', status: '검토중', createdAt: '2026-03-23' },
  { id: 'd7', type: '내용증명', userId: 'user6@test.com', status: '초안', createdAt: '2026-03-22' },
  { id: 'd8', type: '고소장', userId: 'user7@test.com', status: '완료', createdAt: '2026-03-21' },
  { id: 'd9', type: '요청서', userId: 'user8@test.com', status: '완료', createdAt: '2026-03-20' },
  { id: 'd10', type: '경고장', userId: 'user3@test.com', status: '완료', createdAt: '2026-03-19' },
];

type DocType = '전체' | '고소장' | '경고장' | '내용증명' | '요청서';
type DocStatus = '전체' | '초안' | '검토중' | '완료';

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState<DocType>('전체');
  const [statusFilter, setStatusFilter] = useState<DocStatus>('전체');

  // TODO: Firestore 연동 — Firestore 쿼리로 교체
  const filtered = mockDocuments.filter((doc) => {
    const matchType = typeFilter === '전체' || doc.type === typeFilter;
    const matchStatus = statusFilter === '전체' || doc.status === statusFilter;
    return matchType && matchStatus;
  });

  return (
    <div>
      <h2 className="page-title">서류 생성 현황</h2>

      <div className="filters">
        <div className="filter-group">
          <label>유형:</label>
          <div className="filter-buttons">
            {(['전체', '고소장', '경고장', '내용증명', '요청서'] as DocType[]).map((t) => (
              <button
                key={t}
                className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>상태:</label>
          <div className="filter-buttons">
            {(['전체', '초안', '검토중', '완료'] as DocStatus[]).map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>유형</th>
            <th>사용자</th>
            <th>상태</th>
            <th>생성일</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.type}</td>
              <td>{doc.userId}</td>
              <td>
                <span className={`badge ${
                  doc.status === '완료' ? 'badge-success' :
                  doc.status === '검토중' ? 'badge-warning' :
                  'badge-gray'
                }`}>
                  {doc.status}
                </span>
              </td>
              <td>{doc.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-info">총 {filtered.length}건</div>
    </div>
  );
}
