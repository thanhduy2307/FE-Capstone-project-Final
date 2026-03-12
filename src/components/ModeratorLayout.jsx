import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import './CoordinatorLayout.css'; 

const ModeratorLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="coordinator-layout">
      <nav className="coordinator-navbar">
        <div className="navbar-brand">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#coordGradient)" />
            <path d="M24 12L33 18V30L24 36L15 30V18L24 12Z" fill="white" />
            <defs>
              <linearGradient id="coordGradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="hsl(280, 70%, 60%)" />
                <stop offset="100%" stopColor="hsl(320, 65%, 55%)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">Điều Phối (Moderator)</span>
        </div>

        <div className="navbar-menu">
          <Link to="/moderator/theses" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Quản Lý Đề Tài
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Moderator'}</div>
              <div className="user-role">Điều phối viên</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="coordinator-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ModeratorLayout;
