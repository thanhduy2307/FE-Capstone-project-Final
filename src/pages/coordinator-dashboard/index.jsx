import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import './coordinator-dashboard.css';

const CoordinatorDashboard = () => {
  const { user } = useAuthStore();

  // Mock data
  const stats = [
    {
      id: 1,
      title: 'Đề Tài Mới',
      value: '8',
      icon: '📥',
      color: 'blue',
      description: 'Từ GVHD',
    },
    {
      id: 2,
      title: 'Chờ Đánh Mã',
      value: '5',
      icon: '🏷️',
      color: 'yellow',
      description: 'Cần xử lý',
    },
    {
      id: 3,
      title: 'AI Checking',
      value: '3',
      icon: '🤖',
      color: 'purple',
      description: 'Đang kiểm tra',
    },
    {
      id: 4,
      title: 'Đã Phân Công',
      value: '12',
      icon: '✅',
      color: 'green',
      description: 'Reviewer assigned',
    },
  ];

  const recentTheses = [
    {
      id: 1,
      code: 'DT2024001',
      title: 'Ứng dụng Machine Learning trong phân tích dữ liệu',
      studentName: 'Nguyễn Văn A',
      supervisorName: 'TS. Trần Thị B',
      receivedDate: '2024-01-30',
      status: 'pending_code',
    },
    {
      id: 2,
      code: 'DT2024002',
      title: 'Xây dựng hệ thống quản lý bằng Blockchain',
      studentName: 'Lê Thị C',
      supervisorName: 'PGS.TS. Phạm Văn D',
      receivedDate: '2024-01-29',
      status: 'ai_checking',
    },
    {
      id: 3,
      code: 'DT2024003',
      title: 'Phát triển ứng dụng IoT cho Smart Home',
      studentName: 'Hoàng Văn E',
      supervisorName: 'TS. Võ Thị F',
      receivedDate: '2024-01-28',
      status: 'assigned',
    },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending_code':
        return 'warning';
      case 'ai_checking':
        return 'info';
      case 'ai_passed':
        return 'success';
      case 'ai_failed':
        return 'error';
      case 'assigned':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_code':
        return 'Chờ đánh mã';
      case 'ai_checking':
        return 'AI đang check';
      case 'ai_passed':
        return 'AI đạt';
      case 'ai_failed':
        return 'AI không đạt';
      case 'assigned':
        return 'Đã phân công';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  return (
    <div className="coordinator-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Xin chào, {user?.name || 'Coordinator'}! 👋</h1>
          <p className="dashboard-subtitle">
            Quản lý và điều phối đề tài tốt nghiệp
          </p>
        </div>
        <Link to="/coordinator/theses">
          <Button variant="primary" size="md">
            Xem tất cả đề tài
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.id} className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <p className="stat-label">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
                <p className="stat-description">{stat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Workflow Guide */}
      <Card className="workflow-card">
        <h3>📋 Quy Trình Xử Lý Đề Tài</h3>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Nhận đề tài từ GVHD</h4>
              <p>Đề tài được gửi từ giảng viên hướng dẫn</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Đánh mã đề tài</h4>
              <p>Gán mã định danh cho đề tài (VD: DT2024001)</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>AI Checklist</h4>
              <p>Hệ thống AI kiểm tra tự động</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Phân công / Từ chối</h4>
              <p>Đạt: Assign 2 reviewers<br/>Không đạt: Reject</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Theses */}
      <Card>
        <div className="section-header">
          <h3>Đề Tài Mới Nhất</h3>
          <Link to="/coordinator/theses" className="view-all-link">
            Xem tất cả →
          </Link>
        </div>
        <div className="theses-list">
          {recentTheses.map((thesis) => (
            <div key={thesis.id} className="thesis-item">
              <div className="thesis-main">
                <div className="thesis-code-badge">{thesis.code}</div>
                <div className="thesis-info">
                  <h4 className="thesis-title">{thesis.title}</h4>
                  <div className="thesis-meta">
                    <span>👤 SV: {thesis.studentName}</span>
                    <span>👨‍🏫 GVHD: {thesis.supervisorName}</span>
                    <span>📅 {thesis.receivedDate}</span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(thesis.status)}>
                  {getStatusText(thesis.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;
