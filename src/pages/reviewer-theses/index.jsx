import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import { showError } from '../../utils/alert.js';
import api from '../../utils/axios.js';
import './reviewer-theses.css';
import '../lecturer-theses/lecturer-theses.css';

const STATUS_META = {
  PENDING:             { label: 'Chờ xét duyệt', variant: 'warning' },
  IN_REVIEW:           { label: 'Đang xét',       variant: 'info'    },
  NEED_THIRD_REVIEWER: { label: 'Cần GV3 ⚠️',     variant: 'error'   },
  CONSIDER:            { label: 'Xem xét thêm',   variant: 'warning' },
  PASS:                { label: 'Đã duyệt ✅',     variant: 'success' },
  FAIL:                { label: 'Không đạt ❌',    variant: 'error'   },
  FINALIZED:           { label: 'Đã kết thúc 🏁', variant: 'default' },
  APPROVED:            { label: 'Đạt ✅',          variant: 'success' },
  REJECTED:            { label: 'Không đạt ❌',    variant: 'error'   },
};

const ReviewerTheses = () => {
  const { user } = useAuthStore();

  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [allTopics, setAllTopics] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail modal
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [topicReviewers, setTopicReviewers] = useState([]);
  const [isReviewerLoading, setIsReviewerLoading] = useState(false);

  useEffect(() => { fetchSemesters(); }, []);
  useEffect(() => { if (selectedSemesterId) fetchTopics(); }, [selectedSemesterId]);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/api/semesters');
      const list = Array.isArray(res.data) ? res.data : [];
      setSemesters(list);
      const active = list.find(s => s.isActive) || list[0];
      if (active) setSelectedSemesterId(String(active.id));
    } catch (e) {
      console.error('Error fetching semesters', e);
    }
  };

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      let data;
      if (selectedSemesterId) {
        data = await lecturerService.getTopicsBySemester(selectedSemesterId);
      } else {
        data = await lecturerService.getAllTopics();
      }
      setAllTopics(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      try {
        const data = await lecturerService.getAllTopics();
        setAllTopics(Array.isArray(data) ? data : []);
      } catch {
        showError('Không thể tải danh sách đề tài.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (topic) => {
    setSelectedTopic(topic);
    setIsDetailOpen(true);
    setIsReviewerLoading(true);
    setTopicReviewers([]);
    try {
      const detail = await lecturerService.getThesisDetail(topic.id);
      setSelectedTopic(detail);
      const rvRes = await api.get(`/api/topic-reviewers/topic/${topic.id}`).catch(() => ({ data: [] }));
      setTopicReviewers(Array.isArray(rvRes.data) ? rvRes.data : []);
    } catch (e) {
      console.error('Error fetching topic detail', e);
    } finally {
      setIsReviewerLoading(false);
    }
  };

  const filtered = allTopics.filter(t => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const q = searchText.toLowerCase();
    const matchSearch = !q ||
      (t.titleVi || '').toLowerCase().includes(q) ||
      (t.titleEn || '').toLowerCase().includes(q) ||
      (t.code || '').toLowerCase().includes(q) ||
      (t.department || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    const meta = STATUS_META[status] || { label: status || 'N/A', variant: 'default' };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return <span className="na-text">Chờ chấm</span>;
    if (decision === 'APPROVED') return <Badge variant="success">✓ APPROVED</Badge>;
    return <Badge variant="error">✗ REJECTED</Badge>;
  };

  const passCount  = allTopics.filter(t => t.status === 'PASS' || t.status === 'FINALIZED' || t.status === 'APPROVED').length;
  const failCount  = allTopics.filter(t => t.status === 'FAIL' || t.status === 'REJECTED').length;
  const pendCount  = allTopics.filter(t => t.status === 'PENDING' || t.status === 'IN_REVIEW').length;

  return (
    <div className="reviewer-theses-page">
      <div className="page-header">
        <div>
          <h1>📚 Tra Cứu Tất Cả Đề Tài</h1>
          <p className="page-subtitle">Xem toàn bộ đề tài trong học kỳ, tiến độ hội đồng phản biện</p>
        </div>
        <Button variant="outline" onClick={fetchTopics} disabled={isLoading}>🔄 Làm mới</Button>
      </div>

      {/* Summary chips */}
      {!isLoading && (
        <div className="summary-bar">
          <div className="chip chip-total">📚 Tổng: <strong>{allTopics.length}</strong></div>
          <div className="chip chip-success">✅ Đạt: <strong>{passCount}</strong></div>
          <div className="chip chip-error">❌ Không đạt: <strong>{failCount}</strong></div>
          <div className="chip chip-warning">⏳ Đang xét: <strong>{pendCount}</strong></div>
        </div>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <div className="filter-row">
          <div className="filter-group">
            <label>📅 Học kỳ</label>
            <select className="filter-select" value={selectedSemesterId} onChange={e => setSelectedSemesterId(e.target.value)}>
              <option value="">-- Tất cả --</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.code}{s.isActive ? ' ✅' : ''}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>🔖 Trạng thái</label>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group search-group">
            <label>🔍 Tìm kiếm</label>
            <input
              className="filter-input"
              placeholder="Tên đề tài, mã, ngành..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {searchText && (
              <button className="clear-btn" onClick={() => setSearchText('')}>✕</button>
            )}
          </div>
        </div>
      </Card>

      {/* Topic Table */}
      <Card>
        <div className="table-header-flex">
          <h3>Danh sách đề tài</h3>
          <span className="text-muted">{filtered.length} / {allTopics.length} đề tài</span>
        </div>
        <div className="topics-table-wrap">
          <table className="topics-table">
            <thead>
              <tr>
                <th>Mã ĐT</th>
                <th>Tên Đề Tài</th>
                <th>Ngành</th>
                <th>GVHD</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                    Không tìm thấy đề tài nào.
                  </td>
                </tr>
              ) : (
                filtered.map(topic => (
                  <tr key={topic.id}>
                    <td><span className="topic-code-cell">{topic.code || `ID-${topic.id}`}</span></td>
                    <td>
                      <div className="title-main">{topic.titleVi || topic.titleEn || 'N/A'}</div>
                      {topic.titleVi && topic.titleEn && (
                        <div className="title-sub">{topic.titleEn}</div>
                      )}
                    </td>
                    <td><span className="dept-badge">{topic.department || 'N/A'}</span></td>
                    <td className="supervisor-cell">
                      {topic.supervisor?.fullName || <span className="na-text">N/A</span>}
                    </td>
                    <td>{getStatusBadge(topic.status)}</td>
                    <td>
                      <button className="action-btn view-btn" onClick={() => handleViewDetail(topic)}>
                        🔍 Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`🔍 Chi Tiết: ${selectedTopic?.code || ''}`}
        size="lg"
      >
        {selectedTopic && (
          <div className="detail-view">
            <div className="detail-meta">
              <div className="detail-row"><span className="dl">Tên (VI)</span><span className="dv">{selectedTopic.titleVi || '—'}</span></div>
              <div className="detail-row"><span className="dl">Tên (EN)</span><span className="dv">{selectedTopic.titleEn || '—'}</span></div>
              <div className="detail-row"><span className="dl">Ngành</span><span className="dv">{selectedTopic.department || '—'}</span></div>
              <div className="detail-row"><span className="dl">GVHD</span><span className="dv">{selectedTopic.supervisor?.fullName || '—'}</span></div>
              <div className="detail-row"><span className="dl">Trạng thái</span><span className="dv">{getStatusBadge(selectedTopic.status)}</span></div>
              {selectedTopic.aiSimilarityScore !== undefined && selectedTopic.aiSimilarityScore !== null && (
                <div className="detail-row"><span className="dl">Điểm AI</span><span className="dv ai-score">{selectedTopic.aiSimilarityScore}%</span></div>
              )}
            </div>

            {selectedTopic.description && (
              <div className="detail-desc">
                <span className="dl">Mô tả</span>
                <p>{selectedTopic.description}</p>
              </div>
            )}

            {/* Reviewer table */}
            <div className="reviewers-section">
              <h4 style={{ marginBottom: 12 }}>👥 Hội Đồng Phản Biện</h4>
              {isReviewerLoading ? (
                <p className="text-muted">Đang tải...</p>
              ) : topicReviewers.length === 0 ? (
                <p className="text-muted">Chưa có Reviewer nào được phân công.</p>
              ) : (
                <table className="mini-table">
                  <thead>
                    <tr><th>Thứ tự</th><th>Giảng Viên</th><th>Quyết Định</th><th>Điểm</th><th>Nhận Xét</th></tr>
                  </thead>
                  <tbody>
                    {topicReviewers.map((rv, i) => {
                      const orderCls = rv.reviewerOrder === 1 ? 'r1' : rv.reviewerOrder === 2 ? 'r2' : 'r3';
                      return (
                        <tr key={rv.id || i}>
                          <td><span className={`order-badge ${orderCls}`}>R{rv.reviewerOrder || (i + 1)}</span></td>
                          <td><strong>{rv.reviewer?.fullName || rv.reviewerName || 'N/A'}</strong></td>
                          <td>{getDecisionBadge(rv.decision)}</td>
                          <td>{rv.totalScore != null ? <span className="score-sm">{rv.totalScore}/10</span> : '—'}</td>
                          <td className="comment-cell">{rv.comment || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewerTheses;
