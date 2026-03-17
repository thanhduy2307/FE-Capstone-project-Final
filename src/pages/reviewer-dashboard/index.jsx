import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import './reviewer-dashboard.css';

const ReviewerDashboard = () => {
  const { user } = useAuthStore();
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pending, history] = await Promise.all([
        lecturerService.getPendingReviewTheses(user.id).catch(() => []),
        lecturerService.getMyReviewTheses(user.id).catch(() => []),
      ]);
      const pendingArr = Array.isArray(pending) ? pending : (pending?.data || []);
      const historyArr = Array.isArray(history) ? history : (history?.data || []);
      setPendingList(pendingArr);
      setHistoryList(historyArr);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const approved = historyList.filter(a => a.decision === 'APPROVED').length;
  const rejected = historyList.filter(a => a.decision === 'REJECTED').length;
  const completed = historyList.filter(a => a.reviewStatus === 'COMPLETED').length;

  const stats = [
    { id: 1, title: 'Chờ Chấm',       value: isLoading ? '…' : pendingList.length, icon: '⏳', color: 'yellow', description: 'Cần đánh giá' },
    { id: 2, title: 'Đã Hoàn Thành',  value: isLoading ? '…' : completed,           icon: '✅', color: 'green',  description: 'Đã nộp phán quyết' },
    { id: 3, title: 'APPROVED',        value: isLoading ? '…' : approved,            icon: '✔️', color: 'blue',   description: 'Đề tài đạt' },
    { id: 4, title: 'REJECTED',        value: isLoading ? '…' : rejected,            icon: '✖️', color: 'purple', description: 'Đề tài không đạt' },
  ];

  const getOrderLabel = (order) => {
    if (order === 1) return { label: 'Reviewer 1', cls: 'r1' };
    if (order === 2) return { label: 'Reviewer 2', cls: 'r2' };
    if (order === 3) return { label: 'Reviewer 3 (Chốt)', cls: 'r3' };
    return { label: `GV ${order || '?'}`, cls: 'r1' };
  };

  return (
    <div className="reviewer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Xin chào, {user?.fullName || user?.name || 'Giảng viên'}! 👋</h1>
          <p className="dashboard-subtitle">Tổng quan đề tài phản biện của bạn trong hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/lecturer/reviews">
            <Button variant="primary" size="md">📋 Chấm Đề Tài Ngay</Button>
          </Link>
          <Link to="/lecturer/history">
            <Button variant="outline" size="md">📊 Lịch Sử Chấm</Button>
          </Link>
        </div>
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

      {/* Review Process */}
      <Card className="process-card">
        <h3>📋 Quy Trình Phản Biện</h3>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Nhận Đề Tài</h4>
              <p>Moderator phân công đề tài có trạng thái <strong>IN_REVIEW</strong></p>
            </div>
          </div>
          <div className="process-arrow">→</div>
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Điền Checklist & Chấm Điểm</h4>
              <p>Đánh giá 10 tiêu chí, nhập điểm 0–10 và nhận xét</p>
            </div>
          </div>
          <div className="process-arrow">→</div>
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Kết Quả Tự Động</h4>
              <p>✅ ≥ 5 tiêu chí Đạt → APPROVED<br/>❌ &lt; 5 tiêu chí Đạt → REJECTED<br/>🔄 1 APPROVED, 1 REJECTED → Reviewer 3</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending Assignments */}
      <Card>
        <div className="section-header">
          <h3>⏳ Đề Tài Đang Chờ Chấm ({pendingList.length})</h3>
          <Link to="/lecturer/reviews" className="view-all-link">Chấm ngay →</Link>
        </div>
        {isLoading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Đang tải...</p>
        ) : pendingList.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>📭 Không có đề tài nào đang chờ chấm.</p>
        ) : (
          <div className="theses-list">
            {pendingList.slice(0, 5).map((assignment) => {
              const topic = assignment.topic || {};
              const ord = getOrderLabel(assignment.reviewerOrder);
              return (
                <div key={assignment.id} className="thesis-item">
                  <div className="thesis-main">
                    <div className="thesis-code-badge">{topic.code || `ID-${topic.id}`}</div>
                    <div className="thesis-info">
                      <h4 className="thesis-title">{topic.titleVi || topic.titleEn || 'N/A'}</h4>
                      <div className="thesis-meta">
                        <span>🏫 {topic.department || 'N/A'}</span>
                        <span className={`order-mini ${ord.cls}`}>{ord.label}</span>
                      </div>
                    </div>
                    <Badge variant="warning">⏳ Chờ chấm</Badge>
                  </div>
                </div>
              );
            })}
            {pendingList.length > 5 && (
              <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 }}>
                ... và {pendingList.length - 5} đề tài khác
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Recent completed */}
      <Card>
        <div className="section-header">
          <h3>✅ Đã Chấm Gần Đây</h3>
          <Link to="/lecturer/history" className="view-all-link">Xem tất cả →</Link>
        </div>
        {isLoading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Đang tải...</p>
        ) : historyList.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>🗂️ Chưa có lịch sử chấm.</p>
        ) : (
          <div className="theses-list">
            {historyList.slice(0, 5).map((assignment) => {
              const topic = assignment.topic || {};
              const isApproved = assignment.decision === 'APPROVED';
              const ord = getOrderLabel(assignment.reviewerOrder);
              return (
                <div key={assignment.id} className="thesis-item">
                  <div className="thesis-main">
                    <div className="thesis-code-badge">{topic.code || `ID-${topic.id}`}</div>
                    <div className="thesis-info">
                      <h4 className="thesis-title">{topic.titleVi || topic.titleEn || 'N/A'}</h4>
                      <div className="thesis-meta">
                        <span>🏫 {topic.department || 'N/A'}</span>
                        <span className={`order-mini ${ord.cls}`}>{ord.label}</span>
                        {assignment.totalScore != null && (
                          <span style={{ fontWeight: 700, color: assignment.totalScore >= 5 ? '#00b894' : '#e17055' }}>
                            {assignment.totalScore}/10
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={isApproved ? 'success' : 'error'}>
                      {isApproved ? '✓ APPROVED' : '✗ REJECTED'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReviewerDashboard;
