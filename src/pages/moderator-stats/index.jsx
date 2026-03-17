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
      setStats(data);
    } catch (e) {
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
                {/* Debug: show raw payload */}
                <pre className="debug-pre">{JSON.stringify(stats, null, 2)}</pre>
              </div>
            ) : (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Giảng Viên</th>
                    <th>Đã chấm</th>
                    <th>Chờ chấm</th>
                    <th>APPROVED</th>
                    <th>REJECTED</th>
                    <th>Điểm TB</th>
                    <th>Tiến độ</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewers.map((r, i) => {
                    const completed = r.completedCount ?? r.completed ?? 0;
                    const pending   = r.pendingCount   ?? r.pending   ?? 0;
                    const total     = completed + pending;
                    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const approved  = r.approvedCount ?? r.approved ?? '—';
                    const rejected  = r.rejectedCount ?? r.rejected ?? '—';
                    const avgScore  = r.averageScore !== undefined ? Number(r.averageScore).toFixed(1) : '—';

                    return (
                      <tr key={i} className={expandedReviewer === i ? 'row-active' : ''}>
                        <td className="idx-col">{i + 1}</td>
                        <td>
                          <div className="rv-identity">
                            <div className="rv-avatar">{(r.reviewerName || r.fullName || '?').charAt(0)}</div>
                            <div>
                              <div className="rv-name-bold">{r.reviewerName || r.fullName || 'N/A'}</div>
                              {r.email && <div className="rv-email-sm">{r.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="count-done">{completed}</span></td>
                        <td><span className="count-pending">{pending}</span></td>
                        <td>
                          {typeof approved === 'number'
                            ? <Badge variant="success">{approved}</Badge>
                            : <span className="na-text">{approved}</span>}
                        </td>
                        <td>
                          {typeof rejected === 'number'
                            ? <Badge variant="error">{rejected}</Badge>
                            : <span className="na-text">{rejected}</span>}
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
          </Card>
        </>
      )}
    </div>
  );
};

export default ModeratorStats;
