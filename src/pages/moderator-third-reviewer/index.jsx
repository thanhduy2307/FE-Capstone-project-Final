import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import moderatorService from '../../services/moderatorService.js';
import { showSuccess, showError } from '../../utils/alert.js';
import './moderator-third-reviewer.css';

const ModeratorThirdReviewer = () => {
  const [topics, setTopics] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reviewer detail panel inside modal
  const [showingReviewerDetail, setShowingReviewerDetail] = useState(false);
  const [reviewerDetail, setReviewerDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [topicsRes, reviewersRes] = await Promise.all([
        moderatorService.getTopicsNeedThirdReviewer().catch(() => []),
        moderatorService.getAvailableReviewers().catch(() => []),
      ]);
      const topicsList = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || []);
      const reviewersList = Array.isArray(reviewersRes) ? reviewersRes : (reviewersRes?.data || []);
      setTopics(topicsList);
      setAvailableReviewers(reviewersList);
    } catch (e) {
      console.error('Error fetching data:', e);
      showError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // IDs to exclude from R3 picker (filled as soon as modal opens)
  const [excludedReviewerIds, setExcludedReviewerIds] = useState(new Set());

  const handleOpenModal = async (item) => {
    setSelectedTopic(item);
    setSelectedReviewer(null);
    setShowingReviewerDetail(false);
    setReviewerDetail(null);
    setExcludedReviewerIds(new Set());
    setIsModalOpen(true);

    // Pre-load existing reviewers to build exclusion list
    const topicId = item?.topicId || item?.topic?.id || item?.id;
    try {
      const data = await moderatorService.getTopicReviewers(topicId);
      const list = Array.isArray(data) ? data : (data?.data || []);
      const ids = new Set(list.map(r => String(r.reviewer?.id || r.reviewerId || '')).filter(Boolean));
      setExcludedReviewerIds(ids);
      // Also set reviewerDetail so it shows inline
      setReviewerDetail(list);
      setShowingReviewerDetail(true);
    } catch (e) {
      console.error('Could not load topic reviewers for exclusion', e);
    }
  };

  // Quick-load reviewer assignments for the selected topic inside modal
  const handleLoadDetail = async (topicId) => {
    setShowingReviewerDetail(true);
    setIsDetailLoading(true);
    try {
      const data = await moderatorService.getTopicReviewers(topicId);
      setReviewerDetail(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      showError('Không thể tải chi tiết Reviewer.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReviewer) {
      showError('Vui lòng chọn 1 Giảng viên làm Reviewer thứ 3!');
      return;
    }
    setIsSubmitting(true);
    try {
      const topicId = selectedTopic?.topicId || selectedTopic?.topic?.id || selectedTopic?.id;
      // Primary endpoint
      try {
        await moderatorService.assignThirdReviewer(topicId, selectedReviewer);
      } catch {
        await moderatorService.assignThirdReviewerAlt(topicId, selectedReviewer);
      }
      showSuccess('Phân công Reviewer thứ 3 thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      showError('Giáo viên này đã chấm đề tài này.Vui lòng chọn giáo viên khác');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDecisionBadge = (decision) => {
    if (!decision) return <span className="pending-dot">— Chờ chấm</span>;
    if (decision === 'APPROVED') return <Badge variant="success">✓ APPROVED</Badge>;
    return <Badge variant="error">✗ REJECTED</Badge>;
  };

  return (
    <div className="moderator-third-reviewer">
      <div className="page-header">
        <div>
          <h1>⚠️ Đề Tài Cần Reviewer Thứ 3</h1>
          <p className="page-subtitle">
            Các đề tài có kết quả <strong>trái chiều</strong> từ 2 Reviewer đầu — cần người chốt quyết định cuối cùng
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={isLoading}>🔄 Làm mới</button>
      </div>

      <Card>
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            Đang tải danh sách...
          </div>
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Không có đề tài tranh cãi</h3>
            <p>Tất cả đề tài đang có kết quả đồng thuận từ 2 Reviewer.</p>
          </div>
        ) : (
          <table className="third-reviewer-table">
            <thead>
              <tr>
                <th>Mã ĐT</th>
                <th>Tên Đề Tài</th>
                <th>Ngành</th>
                <th>Reviewer 1</th>
                <th>Reviewer 2</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((item) => {
                const topic = item.topic || item;
                return (
                  <tr key={item.id || topic.id}>
                    <td>
                      <span className="topic-code-cell">{topic.code || `ID-${topic.id}`}</span>
                    </td>
                    <td>
                      <div className="title-main">{topic.titleVi || topic.titleEn || 'N/A'}</div>
                      {topic.titleVi && topic.titleEn && (
                        <div className="title-sub">{topic.titleEn}</div>
                      )}
                    </td>
                    <td>
                      <span className="dept-badge">{topic.department || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="reviewer-decision-cell">
                        {item.reviewer1Name && <span className="rv-name">{item.reviewer1Name}</span>}
                        {getDecisionBadge(item.reviewer1Decision)}
                      </div>
                    </td>
                    <td>
                      <div className="reviewer-decision-cell">
                        {item.reviewer2Name && <span className="rv-name">{item.reviewer2Name}</span>}
                        {getDecisionBadge(item.reviewer2Decision)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn detail-btn"
                          onClick={() => handleOpenModal(item)}
                        >
                          🔔 Phân Công GV3
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── ASSIGN R3 MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Phân Công Reviewer Thứ 3 (Chốt Kết Quả)"
        size="lg"
      >
        {selectedTopic && (
          <div className="assign-form">
            {/* Topic info */}
            <div className="topic-summary">
              <span className="topic-code-chip">
                {(selectedTopic.topic || selectedTopic).code || `ID-${(selectedTopic.topic || selectedTopic).id}`}
              </span>
              <h4>{(selectedTopic.topic || selectedTopic).titleVi || (selectedTopic.topic || selectedTopic).titleEn}</h4>
              <p className="conflict-warning">
                🔴 Kết quả từ 2 Reviewer <strong>không đồng thuận</strong> — Reviewer thứ 3 sẽ là phiếu chốt cuối cùng.
              </p>

              {/* Current decisions */}
              <div className="current-decisions">
                <div className="decision-row">
                  <span className="rv-label">Reviewer 1:</span>
                  <span className="rv-val">{selectedTopic.reviewer1Name || '—'}</span>
                  {getDecisionBadge(selectedTopic.reviewer1Decision)}
                </div>
                <div className="decision-row">
                  <span className="rv-label">Reviewer 2:</span>
                  <span className="rv-val">{selectedTopic.reviewer2Name || '—'}</span>
                  {getDecisionBadge(selectedTopic.reviewer2Decision)}
                </div>
              </div>

              {/* Load full reviewer detail */}
              {!showingReviewerDetail ? (
                <button
                  className="load-detail-btn"
                  onClick={() => handleLoadDetail(
                    selectedTopic?.topicId || selectedTopic?.topic?.id || selectedTopic?.id
                  )}
                >
                  🔍 Xem chi tiết điểm & nhận xét
                </button>
              ) : isDetailLoading ? (
                <p className="loading-inline">Đang tải chi tiết...</p>
              ) : reviewerDetail && reviewerDetail.length > 0 ? (
                <div className="detail-expanded">
                  {reviewerDetail.map((rv, i) => (
                    <div key={rv.id || i} className="rv-detail-card">
                      <div className="rv-header">
                        <span className={`order-badge o${rv.reviewerOrder || (i + 1)}`}>
                          Reviewer {rv.reviewerOrder || (i + 1)}
                        </span>
                        <span className="rv-name-sm">{rv.reviewer?.fullName || rv.reviewerName || 'N/A'}</span>
                        <div>{getDecisionBadge(rv.decision)}</div>
                        {rv.totalScore != null && (
                          <span className={`score-sm ${rv.totalScore >= 8 ? 'high' : rv.totalScore >= 5 ? 'medium' : 'low'}`}>
                            {rv.totalScore}/10
                          </span>
                        )}
                      </div>
                      {rv.comment && <p className="rv-comment">"{rv.comment}"</p>}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Reviewer picker — exclude the 2 already-assigned reviewers */}
            <p className="assign-instruction">
              Chọn <strong>1</strong> Giảng viên <strong>mới</strong> làm Reviewer thứ 3 &mdash; 2 người đã chấm trước không được chọn lại
            </p>

            {(() => {
              // Use pre-loaded set from API + fallback to flat props / nested fields
              const combined = new Set(excludedReviewerIds);
              const excludedNames = new Set();
              const topic2 = selectedTopic?.topic || selectedTopic;
              if (selectedTopic?.reviewer1Id) combined.add(String(selectedTopic.reviewer1Id));
              if (selectedTopic?.reviewer2Id) combined.add(String(selectedTopic.reviewer2Id));
              if (topic2?.reviewer1?.id) combined.add(String(topic2.reviewer1.id));
              if (topic2?.reviewer2?.id) combined.add(String(topic2.reviewer2.id));
              if (selectedTopic?.reviewer1Name) excludedNames.add(selectedTopic.reviewer1Name.trim().toLowerCase());
              if (selectedTopic?.reviewer2Name) excludedNames.add(selectedTopic.reviewer2Name.trim().toLowerCase());
              if (topic2?.reviewer1?.fullName) excludedNames.add(topic2.reviewer1.fullName.trim().toLowerCase());
              if (topic2?.reviewer2?.fullName) excludedNames.add(topic2.reviewer2.fullName.trim().toLowerCase());

              const filtered = availableReviewers.filter(r => {
                if (combined.has(String(r.id))) return false;
                if (r.fullName && excludedNames.has(r.fullName.trim().toLowerCase())) return false;
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="empty-reviewer-notice">
                    ⚠️ Không còn giảng viên khả dụng để chọn làm Reviewer thứ 3.
                  </div>
                );
              }

              return (
                <div className="reviewer-grid">
                  {filtered.map(r => (
                    <div
                      key={r.id}
                      className={`reviewer-card${selectedReviewer === r.id ? ' selected' : ''}`}
                      onClick={() => setSelectedReviewer(r.id)}
                    >
                      <div className="reviewer-avatar">{r.fullName?.charAt(0) || 'G'}</div>
                      <div className="reviewer-info">
                        <div className="r-name">{r.fullName}</div>
                        <div className="r-email">{r.email}</div>
                      </div>
                      {selectedReviewer === r.id && <div className="r-check">✓</div>}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="modal-footer">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Huỷ</Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedReviewer}
                style={{ backgroundColor: '#e17055', borderColor: '#e17055', color: '#fff' }}
              >
                {isSubmitting ? '⏳ Đang lưu...' : '🔔 Phân Công GV3'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModeratorThirdReviewer;
