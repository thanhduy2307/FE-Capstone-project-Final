import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import './lecturer-history.css';

const LecturerHistory = () => {
  const { user } = useAuthStore();
  const [historyTheses, setHistoryTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviewHistory();
  }, [user]);

  const fetchReviewHistory = async () => {
    if (!user?.id) {
       setIsLoading(false);
       return;
    }

    try {
      setIsLoading(true);
      const response = await lecturerService.getMyReviewTheses(user.id);
      
      let thesesList = Array.isArray(response) ? response : (response.data || []);
      setHistoryTheses(thesesList);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử chấm thi:', error);
      alert('Không thể tải lịch sử đánh giá. ' + (error.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return <Badge type="success">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge type="error">REJECTED</Badge>;
      case 'CONSIDER':
        return <Badge type="warning">CONSIDER</Badge>;
      default:
        return <Badge type="default">{decision || 'N/A'}</Badge>;
    }
  };

  const getScoreClass = (score) => {
    if (score === undefined || score === null) return '';
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  return (
    <div className="lecturer-history">
      <div className="page-header">
        <div>
          <h1>Lịch Sử Đánh Giá (Review History)</h1>
          <p className="page-subtitle">Danh sách các đề tài bạn đã tham gia hội đồng phản biện</p>
        </div>
      </div>

      <Card>
        <div className="table-header-flex">
          <h3>Danh sách đề tài đã chấm</h3>
          <span className="text-muted">Tổng số: {historyTheses.length} đề tài</span>
        </div>
        
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Mã Đề Tài</th>
                <th>Tên Đề Tài</th>
                <th>Chuyên Ngành</th>
                <th>Quyết Định</th>
                <th>Điểm Số</th>
                <th>Nhận Xét</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Đang tải dữ liệu...</td>
                </tr>
              ) : historyTheses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">Chưa có dữ liệu lịch sử phản biện.</td>
                </tr>
              ) : (
                historyTheses.map((assignment) => {
                  const topic = assignment.topic || {};
                  return (
                    <tr key={assignment.id}>
                      <td><strong>{topic.code || `ID-${topic.id}`}</strong></td>
                      <td>{topic.titleVi || topic.titleEn || 'N/A'}</td>
                      <td>{topic.department || 'N/A'}</td>
                      <td>{getDecisionBadge(assignment.decision)}</td>
                      <td>
                        {assignment.totalScore !== undefined && assignment.totalScore !== null ? (
                          <span className={`score-badge ${getScoreClass(assignment.totalScore)}`}>
                            {assignment.totalScore}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="comment-cell" title={assignment.comment}>
                        {assignment.comment || 'Không có nhận xét'}
                      </td>
                    </tr>
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
