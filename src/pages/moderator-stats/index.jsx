import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import moderatorService from '../../services/moderatorService.js';
import api from '../../utils/axios.js';
import { showError } from '../../utils/alert.js';
import './moderator-stats.css';

const ModeratorStats = () => {
  const [semesters, setSemesters]               = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [stats, setStats]                       = useState(null);
  const [isLoading, setIsLoading]               = useState(false);
  const [expandedReviewer, setExpandedReviewer] = useState(null);
  const [reviewerAssignments, setReviewerAssignments] = useState({});

  useEffect(() => { fetchSemesters(); }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/api/semesters');
      const list = Array.isArray(res.data) ? res.data : [];
      setSemesters(list);
      if (list.length > 0) {
        // Auto-select active semester or first
        const active = list.find(s => s.isActive) || list[0];
        setSelectedSemesterId(active.id);
        fetchStats(active.id);
      }
    } catch (e) {
      console.error('Error fetching semesters:', e);
    }
  };

  const fetchStats = async (semId) => {
    if (!semId) return;
    setIsLoading(true);
    setStats(null);
    try {
      const data = await moderatorService.getReviewerStats(semId);
      
      // If data is an array (per-reviewer stats), we calculate aggregates
      if (Array.isArray(data)) {
        console.log('Moderator Stats Raw Data:', data);
        let totalAssign = 0;
        let totalDone = 0;
        let totalPending = 0;
        
        data.forEach(r => {
          const total = r.assignmentCount ?? r.totalAssignments ?? r.total ?? 0;
          const completed = r.reviewedCount ?? r.completedCount ?? r.completedCount ?? r.completed ?? r.reviewer?.completedCount ?? r.reviewer?.completed ?? 0;
          const pending = r.pendingCount ?? r.pending ?? r.waitingCount ?? r.reviewer?.pendingCount ?? r.reviewer?.pending ?? (total - completed);
          
          totalAssign += total;
          totalDone += completed;
          totalPending += pending;
        });

        // We might also need the 'Need Third Reviewer' count. 
        // Let's try to fetch it separately to give a complete dashboard.
        let needThirdCount = 0;
        try {
          const needThirdData = await moderatorService.getTopicsNeedThirdReviewer();
          needThirdCount = Array.isArray(needThirdData) ? needThirdData.length : 0;
        } catch (err) {
          console.warn('Could not fetch need-third count', err);
        }

        setStats({
          reviewerStats: data,
          totalAssignments: totalAssign,
          completedReviews: totalDone,
          pendingReviews: totalPending,
          needThirdReviewer: needThirdCount
        });
      } else {
        setStats(data);
      }
    } catch (e) {
      console.error('Error in fetchStats:', e);
      showError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const id = e.target.value;
    setSelectedSemesterId(id);
    setExpandedReviewer(null);
    fetchStats(id);
  };

  // Top-level stat cards
  const statCards = stats ? [
    { label: 'Tổng lần phân công',    value: stats.totalAssignments ?? stats.total      ?? '—', color: '#a29bfe', bg: 'rgba(108,92,231,0.12)' },
    { label: 'Đã hoàn thành',         value: stats.completedReviews ?? stats.completed  ?? '—', color: '#00b894', bg: 'rgba(0,184,148,0.12)'   },
    { label: 'Đang chờ đánh giá',     value: stats.pendingReviews   ?? stats.pending    ?? '—', color: '#fdcb6e', bg: 'rgba(253,203,110,0.12)' },
    { label: 'Cần GV thứ 3',          value: stats.needThirdReviewer                    ?? '—', color: '#e17055', bg: 'rgba(225,112,85,0.12)'  },
  ] : [];

  const reviewers = stats?.reviewerStats || stats?.reviewers || [];

  return (
    <div className="moderator-stats">
      <div className="page-header">
        <div>
          <h1>📊 Thống Kê Phản Biện</h1>
          <p className="page-subtitle">Tổng hợp số liệu chấm điểm của Hội Đồng theo từng Học kỳ</p>
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
          <Button variant="outline" onClick={() => fetchStats(selectedSemesterId)} disabled={isLoading}>
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card>
          <div className="loading-state">
            <div className="spinner" />
            Đang tải thống kê...
          </div>
        </Card>
      )}

      {/* No data */}
      {!isLoading && !stats && (
        <Card>
          <div className="empty-state">
            <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
            <p>Chưa có dữ liệu thống kê. Vui lòng chọn học kỳ.</p>
          </div>
        </Card>
      )}

      {!isLoading && stats && (
        <>
          {/* Summary stat cards */}
          <div className="stats-grid">
            {statCards.map((item, idx) => (
              <div key={idx} className="stat-card" style={{ borderColor: item.color + '44', background: item.bg }}>
                <div className="stat-num" style={{ color: item.color }}>{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Per-reviewer table */}
          <Card>
            <div className="table-header-flex">
              <h3>Chi Tiết Theo Giảng Viên</h3>
              <span className="text-muted">{reviewers.length} Reviewer</span>
            </div>

            {reviewers.length === 0 ? (
              <div className="empty-state">
                <p>Không có dữ liệu chi tiết cho học kỳ này.</p>
              </div>
            ) : (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Giảng Viên</th>
                    <th>Đã chấm</th>
                    <th>Đang chờ</th>
                    <th>✓ Đạt</th>
                    <th>✗ Loại</th>
                    <th>🤔 Cân nhắc</th>
                    <th>Điểm TB</th>
                    <th>Tiến độ</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewers.map((r, i) => {
                    const completed = r.reviewedCount ?? r.completedCount ?? r.completed ?? r.reviewer?.completedCount ?? r.reviewer?.completed ?? 0;
                    const total     = r.assignmentCount ?? r.totalAssignments ?? r.total ?? (completed + (r.pendingCount ?? r.pending ?? 0));
                    const pending   = r.pendingCount   ?? r.pending   ?? r.waitingCount ?? r.reviewer?.pendingCount   ?? r.reviewer?.pending   ?? (total - completed);
                    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const approved  = r.approvedCount  ?? r.passCount ?? r.approved  ?? r.reviewer?.approvedCount  ?? r.reviewer?.approved  ?? 0;
                    const rejected  = r.rejectedCount  ?? r.failCount ?? r.rejected  ?? r.reviewer?.rejectedCount  ?? r.reviewer?.rejected  ?? 0;
                    const consider  = r.considerCount  ?? r.consider  ?? r.reviewer?.considerCount  ?? r.reviewer?.consider  ?? 0;
                    const avgScoreVal = r.averageScore ?? r.avgScore ?? r.reviewer?.averageScore ?? r.reviewer?.avgScore;
                    const avgScore  = (avgScoreVal !== undefined && avgScoreVal !== null) ? Number(avgScoreVal).toFixed(1) : '—';

                    return (
                      <tr key={i} className={expandedReviewer === i ? 'row-active' : ''}>
                        <td className="idx-col">{i + 1}</td>
                        <td>
                          <div className="rv-identity">
                            <div className="rv-avatar">{(r.reviewer?.fullName || r.reviewerName || r.fullName || '?').charAt(0)}</div>
                            <div>
                              <div className="rv-name-bold">{r.reviewer?.fullName || r.reviewerName || r.fullName || 'Giảng viên'}</div>
                              {(r.reviewer?.email || r.email) && <div className="rv-email-sm">{r.reviewer?.email || r.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="count-done">{completed}</span></td>
                        <td><span className="count-pending">{pending}</span></td>
                        <td>
                          <Badge variant="success" style={{ opacity: approved > 0 ? 1 : 0.3 }}>{approved}</Badge>
                        </td>
                        <td>
                          <Badge variant="error" style={{ opacity: rejected > 0 ? 1 : 0.3 }}>{rejected}</Badge>
                        </td>
                        <td>
                          <Badge variant="warning" style={{ opacity: consider > 0 ? 1 : 0.3 }}>{consider}</Badge>
                        </td>
                        <td>
                          <span className={`avg-score ${Number(avgScore) >= 8 ? 'high' : Number(avgScore) >= 5 ? 'medium' : 'low'}`}>
                            {avgScore}
                          </span>
                        </td>
                        <td>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="progress-pct">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {reviewers.length > 0 && (
               <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-tertiary)', opacity: 0.5 }}>
                 * Nếu không thấy dữ liệu, vui lòng báo cáo lỗi API /api/topic-reviewers/stats
               </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default ModeratorStats;
