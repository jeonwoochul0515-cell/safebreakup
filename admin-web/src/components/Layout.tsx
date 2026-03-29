import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

interface LayoutProps {
  onLogout: () => void;
}

const navItems = [
  { path: '/', label: '대시보드', icon: '📊' },
  { path: '/users', label: '회원관리', icon: '👥' },
  { path: '/documents', label: '서류현황', icon: '📄' },
  { path: '/sos-logs', label: 'SOS 로그', icon: '🚨' },
  { path: '/revenue', label: '매출', icon: '💰' },
  { path: '/evidence', label: '증거 검토', icon: '🔍' },
  { path: '/consultations', label: '상담 관리', icon: '💬' },
  { path: '/content', label: '콘텐츠', icon: '📝' },
  { path: '/letter-generator', label: '경고장 생성', icon: '✉️' },
];

export default function Layout({ onLogout }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">안전이별 어드민</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </aside>
      <div className="main-area">
        <header className="header">
          <h1 className="header-title">안전이별 어드민</h1>
          <div className="header-user">
            {/* TODO: Firestore 연동 — 로그인 사용자 이메일 표시 */}
            admin@safebreakup.kr
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
