import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Table from '../../components/Table.jsx';
import moderatorService from '../../services/moderatorService.js';
import { showSuccess, showError, showConfirm } from '../../utils/alert.js';
import api from '../../utils/axios.js';
import './moderator-theses.css';

const STATUS_META = {
  PENDING: { label: 'Chờ phân công GV', variant: 'warning' },
  WATTING_MODERATOR: { label: 'Chờ phân công GV', variant: 'warning' },
  WAITING_MODERATOR: { label: 'Chờ phân công GV', variant: 'warning' },
  IN_REVIEW: { label: 'Đang trong HĐ', variant: 'info' },
  CONSIDER: { label: 'Xem xét thêm', variant: 'warning' },
  NEED_THIRD_REVIEWER: { label: 'Cần GV thứ 3 ⚠️', variant: 'error' },
  PASS: { label: 'Đã duyệt ✅', variant: 'success' },
  FAIL: { label: 'Không đạt ❌', variant: 'error' },
  FINALIZED: { label: 'Đã kết thúc 🏁', variant: 'default' },
  LOCKED: { label: 'Đã khoá', variant: 'default' },
};

const ModeratorTheses = () => {
  const [theses, setTheses] = useState([]);
  const [allTheses, setAllTheses] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  // Assign R1+R2 modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Assign R3 modal
  const [isR3Open, setIsR3Open] = useState(false);
  const [selectedR3, setSelectedR3] = useState(null);
  const [isAssigningR3, setIsAssigningR3] = useState(false);

  // Reviewer detail drawer
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [topicReviewers, setTopicReviewers] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailTopic, setDetailTopic] = useState(null);

  // Inheritance history
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTopic, setHistoryTopic] = useState(null);
  const [inheritanceList, setInheritanceList] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Finalize
  const [isFinalizing, setIsFinalizing] = useState(null); // topicId

  useEffect(() => { fetchSemesters(); fetchData(); }, []);

  // Apply client-side filters whenever source data or filters change
  useEffect(() => {
    let filtered = allTheses;
    if (statusFilter !== 'ALL') filtered = filtered.filter(t => t.status === statusFilter);
    const q = searchText.toLowerCase();
    if (q) filtered = filtered.filter(t =>
      (t.titleVi || '').toLowerCase().includes(q) ||
      (t.titleEn || '').toLowerCase().includes(q) ||
      (t.code || '').toLowerCase().includes(q) ||
      (t.department || '').toLowerCase().includes(q)
    );
    setTheses(filtered);
  }, [allTheses, statusFilter, searchText]);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/api/semesters');
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error('Error fetching semesters', e); }
  };

  const fetchData = useCallback(async (semId) => {
    setIsLoading(true);
    try {
      let topicsData;
      if (semId) {
        // GET /api/topics/semester/{semesterId}
        topicsData = await moderatorService.getTopicsBySemester(semId);
      } else {
        topicsData = await moderatorService.getAllTopics();
      }
      const reviewersData = await moderatorService.getAvailableReviewers();
      setAllTheses(Array.isArray(topicsData) ? topicsData : (topicsData?.data || []));
      setAvailableReviewers(Array.isArray(reviewersData) ? reviewersData : (reviewersData?.data || []));
    } catch (err) {
      console.error('Error fetching moderator data:', err);
      showError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSemesterChange = (e) => {
    const id = e.target.value;
    setSelectedSemesterId(id);
    fetchData(id);
  };

  const handleViewHistory = async (topic) => {
    setHistoryTopic(topic);
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    setInheritanceList([]);
    try {
      const data = await moderatorService.getTopicInheritance(topic.id);
      setInheritanceList(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      showError('Không thể tải lịch sử kế thừa.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // ── ASSIGN R1+R2 ──────────────────────────────────────────
  const openAssignModal = (thesis) => {
    setSelectedThesis(thesis);
    setSelectedReviewers([]);
    setIsAssignOpen(true);
  };

  const toggleReviewer = (id) => {
    setSelectedReviewers(prev => {
      if (prev.includes(id)) return prev.filter(r => r !== id);
      if (prev.length >= 2) { showError('Chỉ được chọn tối đa 2 Giảng viên!'); return prev; }
      return [...prev, id];
    });
  };

  const handleSubmitAssign = async () => {
    if (selectedReviewers.length < 2) {
      showError('Vui lòng chọn đủ 2 Giảng viên phản biện!');
      return;
    }
    setIsAssigning(true);
    try {
      // Try primary endpoint first, fallback to alt
      try {
        await moderatorService.assignReviewers(selectedThesis.id, selectedReviewers);
      } catch {
        await moderatorService.assignReviewersAlt(selectedThesis.id, selectedReviewers);
      }
      showSuccess('Phân công Reviewer thành công!');
      setIsAssignOpen(false);
      fetchData();
    } catch (err) {
      showError('Có lỗi xảy ra khi phân công. Vui lòng thử lại.');
    } finally {
      setIsAssigning(false);
    }
  };

  // ── ASSIGN R3 ──────────────────────────────────────────────
  const openR3Modal = (thesis) => {
    setSelectedThesis(thesis);
    setSelectedR3(null);
    setIsR3Open(true);
  };

  const handleSubmitR3 = async () => {
    if (!selectedR3) { showError('Vui lòng chọn 1 Giảng viên làm Reviewer thứ 3!'); return; }
    setIsAssigningR3(true);
    try {
      try {
        await moderatorService.assignThirdReviewer(selectedThesis.id, selectedR3);
      } catch {
        await moderatorService.assignThirdReviewerAlt(selectedThesis.id, selectedR3);
      }
      showSuccess('Phân công Reviewer thứ 3 thành công!');
      setIsR3Open(false);
      fetchData();
    } catch (err) {
      showError('Giáo viên này đã chấm đề tài này. Vui lòng chọn giáo viên khác');
    } finally {
      setIsAssigningR3(false);
    }
  };

  // ── VIEW REVIEWERS ─────────────────────────────────────────
  const handleViewReviewers = async (topic) => {
    setDetailTopic(topic);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setTopicReviewers([]);
    try {
      const data = await moderatorService.getTopicReviewers(topic.id);
      setTopicReviewers(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      showError('Không thể tải thông tin Reviewer của đề tài.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ── FINALIZE ───────────────────────────────────────────────
  const handleFinalize = async (topic) => {
    const confirmed = await showConfirm(
      `Chốt đề tài "${topic.titleVi || topic.titleEn}"?`,
      'Thao tác này sẽ đánh dấu đề tài là FINALIZED và không thể hoàn tác.',
      'Chốt ngay',
      'Huỷ'
    );
    if (!confirmed) return;
    setIsFinalizing(topic.id);
    try {
      await moderatorService.finalizeTopic(topic.id);
      showSuccess('Đề tài đã được chốt thành công (FINALIZED)!');
      fetchData();
    } catch (err) {
      showError('Lỗi khi chốt đề tài: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsFinalizing(null);
    }
  };

  // ── TABLE COLUMNS ──────────────────────────────────────────
  const columns = [
    {
      key: 'code',
      label: 'Mã ĐT',
      render: (value, row) => (
        <span className="topic-code-cell">{row.code || `ID-${row.id}`}</span>
      ),
    },
    {
      key: 'title',
      label: 'Tên Đề Tài',
      render: (_, row) => (
        <div>
          <div className="topic-title-main">{row.titleVi || row.titleEn || 'N/A'}</div>
          {row.titleVi && row.titleEn && (
            <div className="topic-title-sub">{row.titleEn}</div>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Ngành',
      render: (_, row) => <span className="dept-badge">{row.department || 'N/A'}</span>,
    },
    {
      key: 'supervisorName',
      label: 'GVHD',
      render: (_, row) => row.supervisor?.fullName || <span className="na-text">N/A</span>,
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (value) => {
        const meta = STATUS_META[value] || { label: value || 'N/A', variant: 'default' };
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (_, row) => {
        const status = row.status;
        return (
          <div className="action-buttons">
            {/* View Reviewers */}
            <button className="action-btn view-btn" onClick={() => handleViewReviewers(row)}
              title="Xem danh sách Reviewer">
              👥 Reviewer
            </button>

            {/* Inheritance history */}
            <button className="action-btn history-btn" onClick={() => handleViewHistory(row)}
              title="Lịch sử kế thừa/nộp lại">
              📜 Lịch sử
            </button>

            {/* Assign R1+R2 */}
            {(status === 'PENDING' || status === 'WATTING_MODERATOR' || status === 'WAITING_MODERATOR') && (
              <button className="action-btn assign-btn" onClick={() => openAssignModal(row)}>
                ➕ Phân Công
              </button>
            )}

            {/* Assign R3 */}
            {status === 'NEED_THIRD_REVIEWER' && (
              <button className="action-btn r3-btn" onClick={() => openR3Modal(row)}>
                🔔 Phân Công GV3
              </button>
            )}

            {/* Finalize */}
            {(status === 'PASS') && (
              <button
                className="action-btn finalize-btn"
                onClick={() => handleFinalize(row)}
                disabled={isFinalizing === row.id}
              >
                {isFinalizing === row.id ? '⏳...' : '🏁 Chốt'}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ── STATS BAR ──────────────────────────────────────────────
  const pending = allTheses.filter(t => t.status === 'PENDING' || t.status === 'WATTING_MODERATOR' || t.status === 'WAITING_MODERATOR').length;
  const inReview = allTheses.filter(t => t.status === 'IN_REVIEW').length;
  const needR3 = allTheses.filter(t => t.status === 'NEED_THIRD_REVIEWER').length;
  const passed = allTheses.filter(t => t.status === 'PASS').length;

  return (
    <div className="moderator-theses">
      <div className="page-header">
        <div>
          <h1>📋 Quản Lý Đề Tài</h1>
          <p className="page-subtitle">Phân công Reviewer, theo dõi tiến độ và chốt kết quả đề tài</p>
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={isLoading}>
          🔄 Làm mới
        </button>
      </div>

      {/* Summary chips */}
      {!isLoading && (
        <div className="summary-bar">
          <div className="chip chip-warning">⏳ Chờ phân công: <strong>{pending}</strong></div>
          <div className="chip chip-info">🔍 Đang xét: <strong>{inReview}</strong></div>
          <div className="chip chip-error">⚠️ Cần GV3: <strong>{needR3}</strong></div>
          <div className="chip chip-success">✅ Đạt (chờ chốt): <strong>{passed}</strong></div>
        </div>
      )}

      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div className="filter-row">
          <div className="filter-group">
            <label>📅 Học kỳ</label>
            <select className="filter-select" value={selectedSemesterId} onChange={handleSemesterChange}>
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
            <div style={{ position: 'relative' }}>
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
          <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ opacity: 0 }}>.</label>
            <button className="refresh-btn" onClick={() => fetchData(selectedSemesterId)} disabled={isLoading}>
              🔄 Làm mới
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={theses}
          isLoading={isLoading}
          emptyMessage="Không có đề tài nào cần xử lý"
        />
      </Card>

      {/* ── ASSIGN R1+R2 MODAL ── */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="📌 Phân Công 2 Reviewer Chính"
        size="lg"
      >
        {selectedThesis && (
          <div className="assign-form">
            <div className="assign-topic-info">
              <span className="topic-code-chip">{selectedThesis.code || `ID-${selectedThesis.id}`}</span>
              <h4>{selectedThesis.titleVi || selectedThesis.titleEn}</h4>
              <p>Ngành: <strong>{selectedThesis.department}</strong></p>
            </div>

            <p className="assign-instruction">
              Chọn đúng <strong>2</strong> Giảng viên phản biện&nbsp;
              <span className="selected-count">({selectedReviewers.length}/2 đã chọn)</span>
            </p>

            <div className="reviewer-grid">
              {availableReviewers.map(r => {
                const isSelected = selectedReviewers.includes(r.id);
                const order = selectedReviewers.indexOf(r.id) + 1;
                return (
                  <div
                    key={r.id}
                    className={`reviewer-card${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleReviewer(r.id)}
                  >
                    <div className="reviewer-avatar">{r.fullName?.charAt(0) || 'G'}</div>
                    <div className="reviewer-info">
                      <div className="r-name">{r.fullName}</div>
                      <div className="r-email">{r.email}</div>
                    </div>
                    {isSelected && (
                      <div className="r-order-badge">R{order}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Huỷ</Button>
              <Button
                variant="primary"
                onClick={handleSubmitAssign}
                disabled={isAssigning || selectedReviewers.length < 2}
              >
                {isAssigning ? '⏳ Đang lưu...' : '💾 Lưu Phân Công'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ASSIGN R3 MODAL ── */}
      <Modal
        isOpen={isR3Open}
        onClose={() => setIsR3Open(false)}
        title="⚠️ Phân Công Reviewer Thứ 3 (Chốt kết quả)"
        size="lg"
      >
        {selectedThesis && (
          <div className="assign-form">
            <div className="assign-topic-info r3-warning">
              <span className="topic-code-chip">{selectedThesis.code || `ID-${selectedThesis.id}`}</span>
              <h4>{selectedThesis.titleVi || selectedThesis.titleEn}</h4>
              <p className="conflict-note">🔴 Đề tài này có kết quả <strong>trái chiều</strong> từ 2 Reviewer đầu — cần người chốt cuối cùng.</p>
            </div>

            <p className="assign-instruction">Chọn <strong>1</strong> Giảng viên uy tín làm Reviewer thứ 3</p>

            <div className="reviewer-grid">
              {availableReviewers.map(r => (
                <div
                  key={r.id}
                  className={`reviewer-card r3-card${selectedR3 === r.id ? ' selected' : ''}`}
                  onClick={() => setSelectedR3(r.id)}
                >
                  <div className="reviewer-avatar r3-avatar">{r.fullName?.charAt(0) || 'G'}</div>
                  <div className="reviewer-info">
                    <div className="r-name">{r.fullName}</div>
                    <div className="r-email">{r.email}</div>
                  </div>
                  {selectedR3 === r.id && <div className="r-check r3-check">✓</div>}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <Button variant="outline" onClick={() => setIsR3Open(false)}>Huỷ</Button>
              <Button
                onClick={handleSubmitR3}
                disabled={isAssigningR3 || !selectedR3}
                style={{ backgroundColor: '#e17055', borderColor: '#e17055', color: '#fff' }}
              >
                {isAssigningR3 ? '⏳ Đang lưu...' : '🔔 Phân Công GV3'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── REVIEWER DETAIL DRAWER ── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`👥 Reviewer của: ${detailTopic?.code || ''} — ${detailTopic?.titleVi || detailTopic?.titleEn || ''}`}
        size="lg"
      >
        <div className="reviewer-detail">
          {isDetailLoading ? (
            <div className="detail-loading">Đang tải...</div>
          ) : topicReviewers.length === 0 ? (
            <div className="detail-empty">Chưa có Reviewer nào được phân công cho đề tài này.</div>
          ) : (
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Giảng Viên</th>
                  <th>Quyết Định</th>
                  <th>Điểm</th>
                  <th>Nhận Xét</th>
                </tr>
              </thead>
              <tbody>
                {topicReviewers.map((tr, i) => {
                  const reviewer = tr.reviewer || tr.lecturerInfo || {};
                  const orderLabel = tr.reviewerOrder === 1 ? 'Reviewer 1' :
                    tr.reviewerOrder === 2 ? 'Reviewer 2' : 'Reviewer 3 (Chốt)';
                  const orderCls = tr.reviewerOrder === 1 ? 'r1' : tr.reviewerOrder === 2 ? 'r2' : 'r3';
                  return (
                    <tr key={tr.id || i}>
                      <td><span className={`order-badge ${orderCls}`}>{orderLabel}</span></td>
                      <td>
                        <strong>{reviewer.fullName || tr.reviewerName || 'N/A'}</strong>
                        <div className="r-email-sm">{reviewer.email || ''}</div>
                      </td>
                      <td>
                        {tr.decision
                          ? <Badge variant={tr.decision === 'APPROVED' ? 'success' : 'error'}>{tr.decision}</Badge>
                          : <span className="na-text">Chờ chấm</span>}
                      </td>
                      <td>
                        {tr.totalScore !== undefined && tr.totalScore !== null
                          ? <span className={`score-sm ${tr.totalScore >= 8 ? 'high' : tr.totalScore >= 5 ? 'medium' : 'low'}`}>{tr.totalScore}/10</span>
                          : '—'}
                      </td>
                      <td className="comment-td">{tr.comment || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      {/* ── INHERITANCE HISTORY MODAL ── */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={`📜 Lịch Sử Kế Thừa: ${historyTopic?.code || historyTopic?.titleVi || historyTopic?.titleEn || ''}`}
        size="lg"
      >
        <div className="history-view">
          {isHistoryLoading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải lịch sử...</p>
          ) : inheritanceList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🆕</div>
              <p>Đây là đề tài gốc — không có lịch sử kế thừa.</p>
            </div>
          ) : (
            <div className="timeline">
              {inheritanceList.map((item, idx) => {
                const meta = STATUS_META[item.status] || { label: item.status || 'N/A', variant: 'default' };
                return (
                  <div key={item.id || idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="topic-code-cell">{item.code || `ID-${item.id}`}</span>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <div className="timeline-title">{item.titleVi || item.titleEn || 'N/A'}</div>
                      {item.department && <div className="timeline-dept">Ngành: {item.department}</div>}
                      {item.createdAt && (
                        <div className="timeline-date">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ModeratorTheses;

