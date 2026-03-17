import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import api from '../../utils/axios.js';
import { showError } from '../../utils/alert.js';
import './lecturer-stats.css';

const LecturerStats = () => {
  const { user } = useAuthStore();
  
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [allReviews, setAllReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    if (user?.id) {
      fetchSemesters();
      fetchAllReviews(user.id);
    }
  }, [user]);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/api/semesters');
      const list = Array.isArray(res.data) ? res.data : [];
      setSemesters(list);
      if (list.length > 0) {
        // Auto-select active semester or first
        const active = list.find(s => s.isActive) || list[0];
        setSelectedSemesterId(active.id);
      }
    } catch (e) {
      console.error('Error fetching semesters:', e);
    }
  };

  const fetchAllReviews = async (reviewerId) => {
    setIsLoading(true);
    try {
      // Endpoint to get ALL review history for a specific reviewer
      const response = await api.get(`/api/topic-reviewers/reviewer/${reviewerId}`);
      const data = Array.isArray(response.data) ? response.data : 
                   (Array.isArray(response) ? response : []);
      setAllReviews(data);
    } catch (e) {
      console.error('Error fetching reviewer history:', e);
      showError('Không thể tải lịch sử đánh giá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(e.target.value);
  };

  // Filter and calculate stats based on selected semester
  const semesterStats = useMemo(() => {
    if (!selectedSemesterId || allReviews.length === 0) return null;

    // Filter reviews belonging to the selected semester
    const filtered = allReviews.filter(assignment => {
        const topic = assignment.topic;
        if (!topic) return false;
        
        // Match by semester ID (either directly on topic or nested)
        return String(topic.semesterId) === String(selectedSemesterId) || 
               String(topic.semester?.id) === String(selectedSemesterId);
    });

    let completed = 0;
    let pending = 0;
    let needThirdReviewerCount = 0;
    
    filtered.forEach(item => {
        // A review is considered completed if it has a decision
        if (item.decision) {
            completed++;
        } else {
            pending++;
        }
        
        // Count topics that are currently waiting for a 3rd reviewer
        // This usually applies to reviewers R1/R2 who are locked out
        if (item.topic?.status === 'NEED_THIRD_REVIEWER' && item.reviewerOrder <= 2) {
            needThirdReviewerCount++;
        }
    });

    return {
        totalAssignments: filtered.length,
        completedReviews: completed,
        pendingReviews: pending,
        needThirdReviewer: needThirdReviewerCount,
        details: filtered
    };
  }, [allReviews, selectedSemesterId]);

  // Top-level stat cards
  const statCards = [
    { label: 'Tổng lần phân công',    value: semesterStats?.totalAssignments ?? 0, color: '#a29bfe', bg: 'rgba(108,92,231,0.12)' },
    { label: 'Đã hoàn thành',         value: semesterStats?.completedReviews ?? 0, color: '#00b894', bg: 'rgba(0,184,148,0.12)'   },
    { label: 'Đang chờ đánh giá',     value: semesterStats?.pendingReviews   ?? 0, color: '#fdcb6e', bg: 'rgba(253,203,110,0.12)' },
    { label: 'Đề tài Cần GV thứ 3',   value: semesterStats?.needThirdReviewer ?? 0, color: '#e17055', bg: 'rgba(225,112,85,0.12)'  },
  ];

  const getStatusBadge = (decision) => {
    if (!decision) return <span className="status-badge pending">⏳ Chờ chấm</span>;
    if (decision === 'APPROVED' || decision === 'PASS') return <span className="status-badge approved">✓ ĐẠT</span>;
    if (decision === 'CONSIDER') return <span className="status-badge consider">🤔 CÂN NHẮC</span>;
    return <span className="status-badge rejected">✗ KHÔNG ĐẠT</span>;
  };

  const getScoreBadge = (score) => {
    if (score === undefined || score === null) return <span className="na-text">—</span>;
    const numScore = Number(score);
    const variantClass = numScore >= 8 ? 'high' : numScore >= 5 ? 'medium' : 'low';
    return <span className={`score-pill ${variantClass}`}>{numScore.toFixed(1)}/10</span>;
  };

  const getOrderLabel = (order) => {
    if (order === 1) return 'Phản biện 1';
    if (order === 2) return 'Phản biện 2';
    if (order === 3) return 'Phản biện 3 (Chốt)';
    return `GV${order || '?'}`;
  };

  return (
    <div className="lecturer-stats">
      <div className="page-header">
        <div>
          <h1>📊 Thống Kê Phản Biện (Cá Nhân)</h1>
          <p className="page-subtitle">Tổng hợp lịch sử và số liệu chấm điểm của bạn theo từng Học kỳ</p>
        </div>
        <div className="header-controls">
          <select
            className="semester-select"
            value={selectedSemesterId}
            onChange={handleSemesterChange}
          >
            {semesters.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || s.code}{s.isActive ? ' ✅' : ''}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => fetchAllReviews(user?.id)} disabled={isLoading}>
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card>
          <div className="loading-state">
            <div className="spinner" />
            Đang tải dữ liệu thống kê...
          </div>
        </Card>
      )}

      {/* No Data Display */}
      {!isLoading && (!semesterStats || semesterStats.details.length === 0) && (
        <>
          <div className="stats-grid">
            {statCards.map((item, idx) => (
              <div key={idx} className="stat-card" style={{ '--stat-color': item.color, background: item.bg, opacity: 0.5 }}>
                <div className="stat-num" style={{ color: item.color }}>0</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <div className="empty-state">
              <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
              <p>Bạn không có dữ liệu đánh giá nào trong học kỳ này.</p>
            </div>
          </Card>
        </>
      )}

      {/* Data Display */}
      {!isLoading && semesterStats && semesterStats.details.length > 0 && (
        <>
          {/* Summary stat cards */}
          <div className="stats-grid">
            {statCards.map((item, idx) => (
              <div key={idx} className="stat-card" style={{ '--stat-color': item.color, background: item.bg }}>
                <div className="stat-num" style={{ color: item.color }}>{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed table of theses */}
          <Card className="stats-table-card">
            <div className="table-header-flex">
              <h3>Chi tiết các Đề tài được phân công ({semesterStats.totalAssignments})</h3>
            </div>

            <table className="stats-table">
              <thead>
                <tr>
                  <th className="idx-col">STT</th>
                  <th>Mã Đề Tài</th>
                  <th>Tên Đề Tài</th>
                  <th>Ngành</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Điểm Số</th>
                </tr>
              </thead>
              <tbody>
                {semesterStats.details.map((assignment, i) => {
                  const topic = assignment.topic || {};
                  return (
                    <tr key={assignment.id || i}>
                      <td className="idx-col">{i + 1}</td>
                      <td>
                        <span className="topic-code-bold">{topic.code || `ID-${topic.id}`}</span>
                      </td>
                      <td>
                        <div className="topic-title-cell">
                           <span className="topic-title-main">{topic.titleVi || topic.titleEn || '(Không có tên)'}</span>
                           {topic.status === 'NEED_THIRD_REVIEWER' && assignment.reviewerOrder <= 2 && (
                               <div className="conflict-badge">
                                 <span className="dot"></span> Ý kiến trái chiều, đang chờ GV3 chốt
                               </div>
                           )}
                        </div>
                      </td>
                      <td>
                        <span className="topic-dept-badge">{topic.department || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="role-text">
                           {getOrderLabel(assignment.reviewerOrder)}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(assignment.decision)}
                      </td>
                      <td>
                        {getScoreBadge(assignment.totalScore)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

export default LecturerStats;
