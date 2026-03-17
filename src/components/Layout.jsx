import React from 'react';
import Navbar from './Navbar.jsx';
import './Layout.css';

/**
 * Layout Component
 * Wraps pages with navbar and footer
 */
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; 2026 Thesis Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
