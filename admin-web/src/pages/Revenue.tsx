import React from 'react';
import StatCard from '../components/StatCard';
// TODO: Firestore 연동
// import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockMonthlySummary = [
  { month: '2026-03', revenue: 2871000, count: 290, newPaid: 45 },
  { month: '2026-02', revenue: 2574000, count: 260, newPaid: 38 },
  { month: '2026-01', revenue: 2178000, count: 220, newPaid: 32 },
  { month: '2025-12', revenue: 1881000, count: 190, newPaid: 28 },
  { month: '2025-11', revenue: 1584000, count: 160, newPaid: 22 },
  { month: '2025-10', revenue: 1287000, count: 130, newPaid: 18 },
];

const mockPayments = [
  { id: 'p1', userId: 'user1@test.com', date: '2026-03-27', amount: 9900, method: '카드', status: '완료' },
  { id: 'p2', userId: 'user3@test.com', date: '2026-03-27', amount: 9900, method: '카카오페이', status: '완료' },
  { id: 'p3', userId: 'user5@test.com', date: '2026-03-26', amount: 9900, method: '토스페이', status: '완료' },
  { id: 'p4', userId: 'user8@test.com', date: '2026-03-26', amount: 9900, method: '카드', status: '완료' },
  { id: 'p5', userId: 'user2@test.com', date: '2026-03-25', amount: 9900, method: '네이버페이', status: '완료' },
  { id: 'p6', userId: 'user6@test.com', date: '2026-03-25', amount: 9900, method: '카드', status: '실패' },
  { id: 'p7', userId: 'user7@test.com', date: '2026-03-24', amount: 9900, method: '계좌이체', status: '완료' },
  { id: 'p8', userId: 'user4@test.com', date: '2026-03-23', amount: 9900, method: '카드', status: '완료' },
];

export default function Revenue() {
  // TODO: Firestore 연동 — Firestore 집계 쿼리
  const thisMonthRevenue = mockMonthlySummary[0].revenue;
  const thisMonthCount = mockMonthlySummary[0].count;

  return (
    <div>
      <h2 className="page-title">매출 현황</h2>

      <div className="stat-grid">
        <StatCard title="이번 달 매출" value={`${thisMonthRevenue.toLocaleString()}원`} />
        <StatCard title="이번 달 결제 건수" value={thisMonthCount} subtitle="건" color="#E07A5F" />
        <StatCard title="이번 달 신규 유료" value={mockMonthlySummary[0].newPaid} subtitle="명" />
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h3 className="panel-title">월별 매출 요약</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>월</th>
              <th>매출</th>
              <th>결제 건수</th>
              <th>신규 유료</th>
            </tr>
          </thead>
          <tbody>
            {mockMonthlySummary.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{row.revenue.toLocaleString()}원</td>
                <td>{row.count}건</td>
                <td>{row.newPaid}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h3 className="panel-title">최근 결제 이력</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>사용자</th>
              <th>날짜</th>
              <th>금액</th>
              <th>결제수단</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((p) => (
              <tr key={p.id}>
                <td>{p.userId}</td>
                <td>{p.date}</td>
                <td>{p.amount.toLocaleString()}원</td>
                <td>{p.method}</td>
                <td>
                  <span className={`badge ${p.status === '완료' ? 'badge-success' : 'badge-danger'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
