import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import './unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <Card className="unauthorized-card">
        <div className="unauthorized-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-message">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
        </p>
        
        <div className="unauthorized-actions">
          <Link to="/home">
            <Button variant="primary" size="md">
              Về trang chủ
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md">
              Đăng nhập lại
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
