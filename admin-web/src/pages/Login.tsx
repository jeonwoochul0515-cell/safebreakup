import React, { useState } from 'react';
// TODO: Firestore 연동
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../firebase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Firestore 연동 — Firebase Auth 로그인 + role 확인
      // const cred = await signInWithEmailAndPassword(auth, email, password);
      // const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      // if (userDoc.data()?.role !== 'admin') {
      //   throw new Error('관리자 권한이 없습니다.');
      // }

      // Mock: 어드민 로그인 시뮬레이션
      if (email === 'admin@safebreakup.kr' && password === 'admin1234') {
        onLogin();
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">안전이별 어드민</h1>
        <p className="login-subtitle">관리자 계정으로 로그인하세요</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@safebreakup.kr"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="login-hint">Mock: admin@safebreakup.kr / admin1234</p>
      </div>
    </div>
  );
}
