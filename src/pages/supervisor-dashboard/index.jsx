import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useSupervisorStore from '../../stores/supervisorStore.js';
import useAuthStore from '../../stores/authStore.js';
import './supervisor-dashboard.css';

const SupervisorDashboard = () => {
  const { user } = useAuthStore();
  const { myTheses, fetchMyTheses } = useSupervisorStore();

  useEffect(() => {
    // Mock data for now
    // fetchMyTheses();
  }, []);

  // Mock data
  const stats = [
    {
      id: 1,
      title: 'Tổng Đề Tài',
      value: '12',
      icon: '📚',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Chờ Xem Xét',
      value: '5',
      icon: '⏳',
      color: 'yellow',
    },
    {
      id: 3,
      title: 'Đã Gửi',
      value: '7',
      icon: '✅',
      color: 'green',
    },
  ];

  const recentTheses = [
    {
      id: 1,
      title: 'Ứng dụng Machine Learning trong phân tích dữ liệu',
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      submittedDate: '2024-01-30',
      status: 'pending',
      fileName: 'detai_SV001.pdf',
    },
    {
      id: 2,
      title: 'Xây dựng hệ thống quản lý bằng Blockchain',
      studentName: 'Lê Thị C',
      studentCode: 'SV002',
      submittedDate: '2024-01-29',
      status: 'sent_to_coordinator',
      fileName: 'detai_SV002.docx',
    },
    {
      id: 3,
      title: 'Phát triển ứng dụng IoT cho Smart Home',
      studentName: 'Hoàng Văn E',
      studentCode: 'SV003',
      submittedDate: '2024-01-28',
      status: 'reviewed',
      fileName: 'detai_SV003.pdf',
    },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'sent_to_coordinator':
        return 'success';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xem xét';
      case 'reviewed':
        return 'Đã xem';
      case 'sent_to_coordinator':
        return 'Đã gửi';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  return (
    <div className="supervisor-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Xin chào, {user?.name || 'Giảng viên'}! 👋</h1>
          <p className="dashboard-subtitle">
            Tổng quan đề tài được phân công
          </p>
        </div>
        <Link to="/supervisor/theses">
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
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Theses */}
      <Card>
        <div className="section-header">
          <h3>Đề Tài Mới Nhất</h3>
          <Link to="/supervisor/theses" className="view-all-link">
            Xem tất cả →
          </Link>
        </div>
        <div className="theses-list">
          {recentTheses.map((thesis) => (
            <div key={thesis.id} className="thesis-item">
              <div className="thesis-main">
                <div className="thesis-info">
                  <h4 className="thesis-title">{thesis.title}</h4>
                  <div className="thesis-meta">
                    <span className="student-info">
                      👤 {thesis.studentName} ({thesis.studentCode})
                    </span>
                    <span className="file-info">
                      📎 {thesis.fileName}
                    </span>
                    <span className="date-info">
                      📅 {thesis.submittedDate}
                    </span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(thesis.status)}>
                  {getStatusText(thesis.status)}
                </Badge>
              </div>
              <div className="thesis-actions">
                <Link to={`/supervisor/theses`}>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Guide */}
      <Card className="guide-card">
        <h3>📖 Hướng Dẫn Sử Dụng</h3>
        <div className="guide-steps">
          <div className="guide-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>Xem đề tài</h4>
              <p>Kiểm tra danh sách đề tài sinh viên đã nộp</p>
            </div>
          </div>
          <div className="guide-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Tải file đề tài</h4>
              <p>Download file PDF/Word để xem xét nội dung</p>
            </div>
          </div>
          <div className="guide-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>Gửi cho điều phối viên</h4>
              <p>Sau khi xem xét, gửi đề tài cho người điều phối</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupervisorDashboard;
