import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import './lecturer-reviews.css';

const LecturerReviews = () => {
  const { user } = useAuthStore();

  const [assignedTheses, setAssignedTheses] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingTheses();
  }, [user]);

  const fetchPendingTheses = async () => {
    if (!user?.id) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const response = await lecturerService.getPendingReviewTheses(user.id);
      const thesesList = Array.isArray(response) ? response : (response.data || []);
      setAssignedTheses(thesesList);

      const initialState = {};
      thesesList.forEach(item => {
        initialState[item.id] = {
          decision: '',
          totalScore: '',
          comment: ''
        };
      });
      setEvaluations(initialState);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đề tài:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEval = (assignmentId, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], [field]: value }
    }));
  };

  const handleSubmitSingle = async (assignmentId) => {
    const evalData = evaluations[assignmentId];
    if (!evalData.decision) {
      alert('Vui lòng chọn Quyết Định (APPROVED/REJECTED) trước khi lưu!');
      return;
    }
    if (evalData.totalScore === '' || isNaN(Number(evalData.totalScore))) {
      alert('Vui lòng nhập điểm hợp lệ (0 - 10)!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        decision: evalData.decision,
        totalScore: Number(evalData.totalScore),
        comment: evalData.comment || '',
        checklistDetails: `{"score": "${evalData.totalScore}", "verdict": "${evalData.decision}"}`
      };
      await lecturerService.submitReview(assignmentId, payload);
      alert('✅ Lưu đánh giá thành công!');
      fetchPendingTheses();
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      const msg = error?.response?.data?.error || error?.message || 'Lỗi không xác định';
      alert('❌ Lỗi: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lecturer-reviews">
      <div className="page-header">
        <div>
          <h1>Đánh Giá Phản Biện Hội Đồng</h1>
          <p className="page-subtitle">Chấm điểm và quyết định cho từng đề tài được phân công</p>
        </div>
      </div>

      {isLoading && (
        <Card><div className="empty-state">Đang tải danh sách đề tài...</div></Card>
      )}

      {!isLoading && assignedTheses.length === 0 && (
        <Card>
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3>Không có đề tài chờ đánh giá</h3>
            <p>Moderator chưa phân công đề tài nào cho bạn.</p>
          </div>
        </Card>
      )}

      <div className="review-cards-list">
        {!isLoading && assignedTheses.map(assignment => {
          const topic = assignment.topic || assignment;
          const evalData = evaluations[assignment.id] || {};
          return (
            <Card key={assignment.id} className="review-card">
              {/* Topic Info */}
              <div className="review-card-header">
                <div>
                  <span className="topic-code">{topic.code || `ID-${topic.id}`}</span>
                  <h3 className="topic-title">{topic.titleVi || topic.titleEn || 'N/A'}</h3>
                  <p className="topic-dept">{topic.department || ''} · GVHD: {topic.supervisor?.fullName || 'N/A'}</p>
                </div>
                <div className={`reviewer-badge ${
                  assignment.reviewerOrder === 1 ? 'r1' : assignment.reviewerOrder === 2 ? 'r2' : 'r3'
                }`}>
                  GV{assignment.reviewerOrder || '?'}
                </div>
              </div>

              {topic.description && (
                <p className="topic-desc">{topic.description}</p>
              )}

              {/* Evaluation Form */}
              <div className="eval-form">
                {/* Decision */}
                <div className="form-row">
                  <label className="form-label">Quyết Định <span className="required">*</span></label>
                  <div className="decision-btns">
                    <button
                      className={`decision-btn approved ${evalData.decision === 'APPROVED' ? 'active' : ''}`}
                      onClick={() => updateEval(assignment.id, 'decision', 'APPROVED')}
                    >
                      ✓ APPROVED (Đạt)
                    </button>
                    <button
                      className={`decision-btn rejected ${evalData.decision === 'REJECTED' ? 'active' : ''}`}
                      onClick={() => updateEval(assignment.id, 'decision', 'REJECTED')}
                    >
                      ✗ REJECTED (Không đạt)
                    </button>
                  </div>
                </div>

                {/* Score */}
                <div className="form-row">
                  <label className="form-label">Điểm (0 – 10) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    className="score-input"
                    placeholder="Nhập điểm..."
                    value={evalData.totalScore}
                    onChange={e => updateEval(assignment.id, 'totalScore', e.target.value)}
                  />
                </div>

                {/* Comment */}
                <div className="form-row">
                  <label className="form-label">Nhận Xét</label>
                  <textarea
                    className="comment-input"
                    rows={3}
                    placeholder="Nhập nhận xét / phản hồi cho sinh viên..."
                    value={evalData.comment}
                    onChange={e => updateEval(assignment.id, 'comment', e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <Button
                    variant="primary"
                    onClick={() => handleSubmitSingle(assignment.id)}
                    disabled={isSubmitting || !evalData.decision}
                  >
                    {isSubmitting ? 'Đang Lưu...' : '💾 Lưu Đánh Giá'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LecturerReviews;
