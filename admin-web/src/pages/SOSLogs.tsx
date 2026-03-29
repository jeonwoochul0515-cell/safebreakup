import React, { useState } from 'react';
// TODO: Firestore 연동
// import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockSOSLogs = [
  { id: 's1', userId: 'user1@test.com', type: '긴급 SOS', timestamp: '2026-03-27 14:30:22' },
  { id: 's2', userId: 'user3@test.com', type: '위치 공유', timestamp: '2026-03-27 11:15:08' },
  { id: 's3', userId: 'user2@test.com', type: '긴급 SOS', timestamp: '2026-03-26 23:45:11' },
  { id: 's4', userId: 'user5@test.com', type: '긴급 녹음', timestamp: '2026-03-26 18:20:33' },
  { id: 's5', userId: 'user4@test.com', type: '긴급 SOS', timestamp: '2026-03-25 09:10:45' },
  { id: 's6', userId: 'user1@test.com', type: '위치 공유', timestamp: '2026-03-24 16:55:12' },
  { id: 's7', userId: 'user6@test.com', type: '긴급 SOS', timestamp: '2026-03-24 02:30:00' },
  { id: 's8', userId: 'user7@test.com', type: '긴급 녹음', timestamp: '2026-03-23 20:15:44' },
  { id: 's9', userId: 'user8@test.com', type: '긴급 SOS', timestamp: '2026-03-22 13:40:18' },
  { id: 's10', userId: 'user2@test.com', type: '위치 공유', timestamp: '2026-03-21 07:25:33' },
];

export default function SOSLogs() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // TODO: Firestore 연동 — Firestore 쿼리로 교체
  const filtered = mockSOSLogs.filter((log) => {
    if (dateFrom && log.timestamp < dateFrom) return false;
    if (dateTo && log.timestamp > dateTo + ' 23:59:59') return false;
    return true;
  });

  return (
    <div>
      <h2 className="page-title">SOS 발동 로그</h2>

      <div className="filters">
        <div className="filter-group">
          <label>시작일:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>종료일:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>유형</th>
            <th>시각</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log) => (
            <tr key={log.id}>
              <td>{log.userId}</td>
              <td>
                <span className={`badge ${
                  log.type === '긴급 SOS' ? 'badge-danger' :
                  log.type === '긴급 녹음' ? 'badge-warning' :
                  'badge-info'
                }`}>
                  {log.type}
                </span>
              </td>
              <td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-info">총 {filtered.length}건</div>
    </div>
  );
}
