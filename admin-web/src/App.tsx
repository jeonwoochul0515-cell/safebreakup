import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// TODO: Firestore 연동 — Firebase Auth 실시간 리스너로 교체
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from './firebase';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Documents from './pages/Documents';
import SOSLogs from './pages/SOSLogs';
import Revenue from './pages/Revenue';

function App() {
  // TODO: Firestore 연동 — Firebase Auth 상태로 교체
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock: 로그인 상태 시뮬레이션
  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>로딩 중...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAdmin ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route element={
          isAdmin ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/sos-logs" element={<SOSLogs />} />
          <Route path="/revenue" element={<Revenue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
