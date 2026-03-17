import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import { showError } from '../../utils/alert.js';
import './lecturer-history.css';

const LecturerHistory = () => {
  const { user } = useAuthStore();
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user]);

  // GET /api/topic-reviewers/reviewer/{reviewerId}
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await lecturerService.getMyReviewTheses(user.id);
      const list = Array.isArray(response) ? response : (response.data || []);
      setHistoryList(list);
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử:', err);
      showError('Không thể tải lịch sử chấm thi.');
    } finally {
      setIsLoading(false);
    }
  };

  // GET /api/topic-reviewers/{topicReviewerId}
  const handleViewDetail = async (assignmentId) => {
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null);
      return;
    }
    setIsDetailLoading(true);
    try {
      const detail = await lecturerService.getReviewAssignmentDetail(assignmentId);
      setSelectedAssignment(detail);
    } catch (err) {
      showError('Không thể tải chi tiết đánh giá.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return <Badge variant="success">✓ APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="error">✗ REJECTED</Badge>;
      case 'CONSIDER':
        return <Badge variant="warning">🔎 CONSIDER</Badge>;
      default:
        return <Badge variant="default">{decision || 'Chờ xử lý'}</Badge>;
    }
  };

  const getScoreClass = (score) => {
    if (score === undefined || score === null) return '';
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const getOrderBadge = (order) => {
    if (order === 1) return <span className="order-badge r1">Reviewer 1</span>;
    if (order === 2) return <span className="order-badge r2">Reviewer 2</span>;
    if (order === 3) return <span className="order-badge r3">Reviewer 3 (Chốt)</span>;
    return <span className="order-badge r1">GV{order || '?'}</span>;
  };

  // Stats
  const total = historyList.length;
  const approved = historyList.filter(a => a.decision === 'APPROVED').length;
  const rejected = historyList.filter(a => a.decision === 'REJECTED').length;
  const avgScore = historyList.length
    ? (historyList.reduce((sum, a) => sum + (Number(a.totalScore) || 0), 0) / historyList.length).toFixed(1)
    : '—';

  return (
    <div className="lecturer-history">
      <div className="page-header">
        <div>
          <h1>📊 Lịch Sử Chấm Thi</h1>
          <p className="page-subtitle">Tất cả lượt phản biện bạn đã tham gia hội đồng</p>
        </div>
        <Button variant="outline" onClick={fetchHistory} disabled={isLoading}>🔄 Làm mới</Button>
      </div>

      {/* Stats Summary */}
      {!isLoading && historyList.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">{total}</div>
            <div className="stat-label">Tổng đề tài đã chấm</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-num">{approved}</div>
            <div className="stat-label">APPROVED</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-num">{rejected}</div>
            <div className="stat-label">REJECTED</div>
          </div>
          <div className="stat-card score">
            <div className="stat-num">{avgScore}</div>
            <div className="stat-label">Điểm TB</div>
          </div>
        </div>
      )}

      {/* History Table */}
      <Card>
        <div className="table-header-flex">
          <h3>Danh sách lượt chấm</h3>
          {!isLoading && <span className="text-muted">Tổng: {total} lượt</span>}
        </div>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Mã Đề Tài</th>
                <th>Tên Đề Tài</th>
                <th>Ngành</th>
                <th>Vai trò</th>
                <th>Quyết Định</th>
                <th>Điểm</th>
                <th>Nhận Xét</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🗂️</div>
                    Chưa có lịch sử phản biện nào.
                  </td>
                </tr>
              ) : (
                historyList.map((assignment) => {
                  const topic = assignment.topic || {};
                  const isExpanded = selectedAssignment?.id === assignment.id;
                  return (
                    <React.Fragment key={assignment.id}>
                      <tr className={isExpanded ? 'row-expanded' : ''}>
                        <td><strong>{topic.code || `ID-${topic.id}`}</strong></td>
                        <td>
                          <div className="title-cell">
                            <div>{topic.titleVi || topic.titleEn || 'N/A'}</div>
                            {topic.titleVi && topic.titleEn && (
                              <div className="title-en">{topic.titleEn}</div>
                            )}
                          </div>
                        </td>
                        <td>{topic.department || 'N/A'}</td>
                        <td>{getOrderBadge(assignment.reviewerOrder)}</td>
                        <td>{getDecisionBadge(assignment.decision)}</td>
                        <td>
                          {assignment.totalScore !== undefined && assignment.totalScore !== null ? (
                            <span className={`score-badge ${getScoreClass(assignment.totalScore)}`}>
                              {assignment.totalScore}/10
                            </span>
                          ) : '—'}
                        </td>
                        <td className="comment-cell" title={assignment.comment}>
                          {assignment.comment || <span className="no-comment">—</span>}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LecturerHistory;
