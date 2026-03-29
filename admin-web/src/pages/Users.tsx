import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: Firestore 연동
// import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockUsers = [
  { id: 'u1', email: 'user1@test.com', nickname: '피해자A', createdAt: '2026-03-27', tier: 'standard', evidenceCount: 12 },
  { id: 'u2', email: 'user2@test.com', nickname: '피해자B', createdAt: '2026-03-26', tier: 'free', evidenceCount: 3 },
  { id: 'u3', email: 'user3@test.com', nickname: '피해자C', createdAt: '2026-03-25', tier: 'standard', evidenceCount: 27 },
  { id: 'u4', email: 'user4@test.com', nickname: '피해자D', createdAt: '2026-03-24', tier: 'free', evidenceCount: 0 },
  { id: 'u5', email: 'user5@test.com', nickname: '피해자E', createdAt: '2026-03-23', tier: 'standard', evidenceCount: 8 },
  { id: 'u6', email: 'user6@test.com', nickname: '피해자F', createdAt: '2026-03-22', tier: 'free', evidenceCount: 1 },
  { id: 'u7', email: 'user7@test.com', nickname: '피해자G', createdAt: '2026-03-21', tier: 'free', evidenceCount: 5 },
  { id: 'u8', email: 'user8@test.com', nickname: '피해자H', createdAt: '2026-03-20', tier: 'standard', evidenceCount: 15 },
];

type TierFilter = 'all' | 'free' | 'standard';

export default function Users() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');

  // TODO: Firestore 연동 — Firestore 쿼리로 교체
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.nickname.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div>
      <h2 className="page-title">회원관리</h2>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="이메일 또는 닉네임 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-buttons">
          {(['all', 'free', 'standard'] as TierFilter[]).map((tier) => (
            <button
              key={tier}
              className={`filter-btn ${tierFilter === tier ? 'active' : ''}`}
              onClick={() => setTierFilter(tier)}
            >
              {tier === 'all' ? '전체' : tier === 'free' ? '무료' : '유료'}
            </button>
          ))}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>이메일</th>
            <th>닉네임</th>
            <th>가입일</th>
            <th>구독</th>
            <th>증거 수</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className="clickable-row"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <td>{user.email}</td>
              <td>{user.nickname}</td>
              <td>{user.createdAt}</td>
              <td>
                <span className={`badge ${user.tier === 'standard' ? 'badge-gold' : 'badge-gray'}`}>
                  {user.tier === 'standard' ? '유료' : '무료'}
                </span>
              </td>
              <td>{user.evidenceCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-info">총 {filteredUsers.length}명</div>
    </div>
  );
}
