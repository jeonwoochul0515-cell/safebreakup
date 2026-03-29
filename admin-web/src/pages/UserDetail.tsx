import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// TODO: Firestore 연동
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase';

// Mock 데이터
const mockUserDetail = {
  id: 'u1',
  email: 'user1@test.com',
  nickname: '피해자A',
  createdAt: '2026-03-27',
  tier: 'standard',
  subscriptionStart: '2026-03-01',
  subscriptionEnd: '2026-04-01',
  evidenceCount: 12,
  payments: [
    { id: 'p1', date: '2026-03-01', amount: 9900, method: '카드', status: '완료' },
    { id: 'p2', date: '2026-02-01', amount: 9900, method: '카카오페이', status: '완료' },
    { id: 'p3', date: '2026-01-01', amount: 9900, method: '카드', status: '완료' },
  ],
  documents: [
    { id: 'd1', type: '경고장', status: '완료', createdAt: '2026-03-20' },
    { id: 'd2', type: '내용증명', status: '완료', createdAt: '2026-03-15' },
    { id: 'd3', type: '고소장', status: '초안', createdAt: '2026-03-25' },
  ],
};

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // TODO: Firestore 연동 — Firestore에서 사용자 조회
  const user = mockUserDetail;

  const [tier, setTier] = useState(user.tier);
  const [subStart, setSubStart] = useState(user.subscriptionStart);
  const [subEnd, setSubEnd] = useState(user.subscriptionEnd);

  const handleSave = async () => {
    // TODO: Firestore 연동 — Firestore 업데이트
    // await updateDoc(doc(db, 'users', userId), {
    //   subscription_tier: tier,
    //   subscription_start: subStart,
    //   subscription_end: subEnd,
    // });
    alert('저장되었습니다. (Mock)');
  };

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/users')}>&larr; 회원목록</button>
        <h2 className="page-title">회원 상세</h2>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h3 className="panel-title">프로필</h3>
          <div className="detail-row">
            <span className="detail-label">이메일</span>
            <span>{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">닉네임</span>
            <span>{user.nickname}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">가입일</span>
            <span>{user.createdAt}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">증거 수</span>
            <span>{user.evidenceCount}건</span>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">구독 관리</h3>
          <div className="detail-row">
            <span className="detail-label">구독 상태</span>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="free">무료 (free)</option>
              <option value="standard">유료 (standard)</option>
            </select>
          </div>
          <div className="detail-row">
            <span className="detail-label">구독 시작일</span>
            <input type="date" value={subStart} onChange={(e) => setSubStart(e.target.value)} />
          </div>
          <div className="detail-row">
            <span className="detail-label">구독 만료일</span>
            <input type="date" value={subEnd} onChange={(e) => setSubEnd(e.target.value)} />
          </div>
          <button className="save-btn" onClick={handleSave}>변경사항 저장</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h3 className="panel-title">결제 이력</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>금액</th>
              <th>결제수단</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {user.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.amount.toLocaleString()}원</td>
                <td>{p.method}</td>
                <td><span className="badge badge-success">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h3 className="panel-title">서류 생성 이력</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>유형</th>
              <th>상태</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {user.documents.map((d) => (
              <tr key={d.id}>
                <td>{d.type}</td>
                <td>
                  <span className={`badge ${d.status === '완료' ? 'badge-success' : 'badge-warning'}`}>
                    {d.status}
                  </span>
                </td>
                <td>{d.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
