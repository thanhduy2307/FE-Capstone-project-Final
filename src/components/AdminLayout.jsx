import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      
      <div className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="admin-header">
          <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          <div className="header-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="header-actions">
            <button className="header-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>
        
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={toggleMobileSidebar} />
      )}
    </div>
  );
};

export default AdminLayout;
