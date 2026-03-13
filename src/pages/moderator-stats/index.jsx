import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import api from '../../utils/axios.js';
import './moderator-stats.css';

const ModeratorStats = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/api/semesters');
      const list = Array.isArray(res.data) ? res.data : [];
      setSemesters(list);
      if (list.length > 0) {
        setSelectedSemesterId(list[0].id);
        fetchStats(list[0].id);
      }
    } catch (e) {
      console.error('Error fetching semesters:', e);
    }
  };

  const fetchStats = async (semId) => {
    if (!semId) return;
    try {
      setIsLoading(true);
      setStats(null);
      const res = await api.get(`/api/topic-reviewers/stats/${semId}`);
      setStats(res.data);
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const id = e.target.value;
    setSelectedSemesterId(id);
    fetchStats(id);
  };

  const statItems = stats ? [
    { label: 'Tổng số lần phân công', value: stats.totalAssignments ?? stats.total ?? 'N/A', color: '#6c5ce7' },
    { label: 'Đã hoàn thành đánh giá', value: stats.completedReviews ?? stats.completed ?? 'N/A', color: '#00b894' },
    { label: 'Đang chờ đánh giá', value: stats.pendingReviews ?? stats.pending ?? 'N/A', color: '#fdcb6e' },
    { label: 'Đề tài cần GV thứ 3', value: stats.needThirdReviewer ?? 'N/A', color: '#e17055' },
  ] : [];

  return (
    <div className="moderator-stats">
      <div className="page-header">
        <div>
          <h1>Thống Kê Phản Biện</h1>
          <p className="page-subtitle">Tổng hợp số liệu chấm điểm của Hội Đồng theo từng học kỳ</p>
        </div>
        <div className="header-actions">
          <select
            className="semester-select"
            value={selectedSemesterId}
            onChange={handleSemesterChange}
          >
            {semesters.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.name || sem.code}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">Đang tải thống kê...</div>
      )}

      {!isLoading && stats && (
        <>
          <div className="stats-grid">
            {statItems.map((item, idx) => (
              <Card key={idx} className="stat-card">
                <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </Card>
            ))}
          </div>

          {stats.reviewerStats && stats.reviewerStats.length > 0 && (
            <Card>
              <h3 style={{ marginBottom: '16px' }}>Chi tiết theo Giảng Viên</h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Giảng Viên</th>
                    <th>Số đề tài đã chấm</th>
                    <th>Đề tài đang chờ</th>
                    <th>Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.reviewerStats.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.reviewerName || r.fullName || 'N/A'}</strong></td>
                      <td>{r.completedCount ?? r.completed ?? 'N/A'}</td>
                      <td>{r.pendingCount ?? r.pending ?? 'N/A'}</td>
                      <td>{r.averageScore !== undefined ? r.averageScore.toFixed(1) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {(!stats.reviewerStats || stats.reviewerStats.length === 0) && (
            <Card>
              <div className="empty-state">
                <p>Không có dữ liệu chi tiết cho học kỳ này.</p>
                <pre style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px', textAlign: 'left' }}>
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </>
      )}

      {!isLoading && !stats && (
        <Card>
          <div className="empty-state">Chưa có dữ liệu thống kê. Vui lòng chọn học kỳ.</div>
        </Card>
      )}
    </div>
  );
};

export default ModeratorStats;
