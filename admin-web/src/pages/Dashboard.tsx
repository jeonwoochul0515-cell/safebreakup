import React from 'react';
import StatCard from '../components/StatCard';
// TODO: Firestore 연동
// import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockRecentUsers = [
  { id: '1', email: 'user1@test.com', nickname: '피해자A', createdAt: '2026-03-27' },
  { id: '2', email: 'user2@test.com', nickname: '피해자B', createdAt: '2026-03-26' },
  { id: '3', email: 'user3@test.com', nickname: '피해자C', createdAt: '2026-03-25' },
  { id: '4', email: 'user4@test.com', nickname: '피해자D', createdAt: '2026-03-24' },
  { id: '5', email: 'user5@test.com', nickname: '피해자E', createdAt: '2026-03-23' },
];

const mockRecentSOS = [
  { id: '1', userId: 'user1@test.com', type: '긴급 SOS', timestamp: '2026-03-27 14:30' },
  { id: '2', userId: 'user3@test.com', type: '위치 공유', timestamp: '2026-03-27 11:15' },
  { id: '3', userId: 'user2@test.com', type: '긴급 SOS', timestamp: '2026-03-26 23:45' },
  { id: '4', userId: 'user5@test.com', type: '긴급 녹음', timestamp: '2026-03-26 18:20' },
  { id: '5', userId: 'user4@test.com', type: '긴급 SOS', timestamp: '2026-03-25 09:10' },
];

export default function Dashboard() {
  // TODO: Firestore 연동 — onSnapshot으로 실시간 조회
  const totalUsers = 1247;
  const paidUsers = 312;
  const todaySOS = 5;
  const totalDocuments = 891;

  return (
    <div>
      <h2 className="page-title">대시보드</h2>

      <div className="stat-grid">
        <StatCard title="총 회원 수" value={totalUsers.toLocaleString()} subtitle="명" />
        <StatCard title="유료 회원 수" value={paidUsers.toLocaleString()} subtitle="명" color="#E07A5F" />
        <StatCard title="오늘 SOS 건수" value={todaySOS} subtitle="건" color="#E07A5F" />
        <StatCard title="서류 생성 건수" value={totalDocuments.toLocaleString()} subtitle="건" />
      </div>

      <div className="dashboard-panels">
        <div className="panel">
          <h3 className="panel-title">최근 가입자 5명</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>닉네임</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.nickname}</td>
                  <td>{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3 className="panel-title">최근 SOS 5건</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>사용자</th>
                <th>유형</th>
                <th>시각</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentSOS.map((sos) => (
                <tr key={sos.id}>
                  <td>{sos.userId}</td>
                  <td><span className="badge badge-danger">{sos.type}</span></td>
                  <td>{sos.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
