import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import useAuthStore from '../../stores/authStore.js';
import lecturerService from '../../services/lecturerService.js';
import { showSuccess, showError, showWarning } from '../../utils/alert.js';
import './lecturer-reviews.css';

const LecturerReviews = () => {
  const { user } = useAuthStore();

  const [assignedTheses, setAssignedTheses] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(null); // trackà assignmentId

  useEffect(() => {
    if (user?.id) fetchPendingTheses();
  }, [user]);

  // GET /api/topic-reviewers/reviewer/{reviewerId}/pending
  const fetchPendingTheses = async () => {
    setIsLoading(true);
    try {
      const response = await lecturerService.getPendingReviewTheses(user.id);
      const list = Array.isArray(response) ? response : (response.data || []);
      setAssignedTheses(list);

      const initState = {};
      list.forEach(item => {
        initState[item.id] = { 
          decision: '', 
          totalScore: '', 
          comment: '',
          checklist: {
            c1: '', c2: '', c3: '', c4: '', c5: '', 
            c6: '', c7: '', c8: '', c9: '', c10: ''
          }
        };
      });
      setEvaluations(initState);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đề tài:', err);
      showError('Không thể tải danh sách đề tài cần chấm.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEval = (id, field, value) => {
    setEvaluations(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const updateChecklist = (id, feature, value) => {
    setEvaluations(prev => {
      const currentEval = prev[id];
      const newChecklist = { ...currentEval.checklist, [feature]: value };
      
      // Auto-calculate suggested decision: >= 5 'X' (Đạt) -> APPROVED, else REJECTED
      let passCount = 0;
      Object.values(newChecklist).forEach(val => {
        if (val === 'X') passCount++;
      });
      
      // We will update the suggested decision, but they can still manually change it.
      // Auto-update decision if the user hasn't explicitly locked it, or just force update it. 
      // Force update makes more sense for a guided checklist.
      const suggestedDecision = passCount >= 5 ? 'APPROVED' : 'REJECTED';

      return {
        ...prev,
        [id]: {
          ...currentEval,
          checklist: newChecklist,
          decision: suggestedDecision // Auto-apply the decision
        }
      };
    });
  };

  // POST /api/topic-reviewers/{topicReviewerId}/submit
  // Body: { topicId, reviewerId, decision, totalScore, comment, checklistDetails }
  const handleSubmit = async (assignment) => {
    const evalData = evaluations[assignment.id];

    // Validation
    if (!evalData?.decision) {
      showWarning('Vui lòng chọn Quyết Định trước khi nộp!');
      return;
    }
    if (evalData.decision === 'CONSIDER') {
      showWarning('🤔 CONSIDER là trạng thái tạm thời. Bạn cần chọn ✓ APPROVED hoặc ✗ REJECTED để nộp phán quyết cuối!');
      return;
    }
    if (evalData.totalScore === '' || isNaN(Number(evalData.totalScore))) {
      showWarning('Vui lòng nhập điểm hợp lệ (0 – 10)!');
      return;
    }
    if (Number(evalData.totalScore) < 0 || Number(evalData.totalScore) > 10) {
      showWarning('Điểm phải nằm trong khoảng 0 – 10!');
      return;
    }

    // Extract IDs from nested assignment object (matching backend JSON structure)
    const topicReviewerId = assignment.id;                          // e.g. 11
    const topicId         = assignment.topic?.id ?? assignment.topicId; // e.g. 21
    const reviewerId      = assignment.reviewer?.id ?? user?.id;    // e.g. 2

    // Build payload exactly as backend expects
    const payload = {
      topicId:          topicId,
      reviewerId:       reviewerId,
      decision:         evalData.decision,          // "APPROVED" | "REJECTED"
      totalScore:       Number(evalData.totalScore),
      comment:          evalData.comment || '',
      checklistDetails: JSON.stringify(evalData.checklist),
    };

    setIsSubmitting(assignment.id);
    try {
      // Primary: POST /api/topic-reviewers/{topicReviewerId}/submit
      await lecturerService.submitReview(topicReviewerId, payload);
      showSuccess('✅ Nộp đánh giá thành công!');
      setSubmittedIds(prev => new Set([...prev, assignment.id]));
      setTimeout(fetchPendingTheses, 800);
    } catch (primaryErr) {
      console.warn('Primary submit failed, trying fallback...', primaryErr);
      try {
        // Fallback: POST /api/topic-reviewers/submit (full body)
        await lecturerService.submitReviewByTopic(payload);
        showSuccess('✅ Nộp đánh giá thành công!');
        setSubmittedIds(prev => new Set([...prev, assignment.id]));
        setTimeout(fetchPendingTheses, 800);
      } catch (fallbackErr) {
        const msg =
          fallbackErr?.response?.data?.message ||
          fallbackErr?.response?.data?.error   ||
          fallbackErr?.message                   ||
          'Lỗi không xác định';
        showError('❌ Lỗi khi nộp: ' + msg);
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setIsSubmitting(null);
    }
  };


  const getOrderLabel = (order) => {
    if (order === 1) return { label: 'Reviewer 1', cls: 'r1' };
    if (order === 2) return { label: 'Reviewer 2', cls: 'r2' };
    if (order === 3) return { label: 'Reviewer 3 (Chốt)', cls: 'r3' };
    return { label: `GV${order || '?'}`, cls: 'r1' };
  };

  return (
    <div className="lecturer-reviews">
      <div className="page-header">
        <div>
          <h1>📋 Đề Tài Chờ Chấm</h1>
          <p className="page-subtitle">
            Danh sách đề tài Moderator phân công — Chấm điểm và đưa ra quyết định
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchPendingTheses} disabled={isLoading}>
          🔄 Làm mới
        </button>
      </div>

      {/* Summary bar */}
      {!isLoading && (
        <div className="summary-bar">
          <div className="summary-chip total">
            📚 Tổng: <strong>{assignedTheses.length}</strong>
          </div>
          <div className="summary-chip done">
            ✅ Đã nộp: <strong>{submittedIds.size}</strong>
          </div>
          <div className="summary-chip pending">
            ⏳ Chờ: <strong>{assignedTheses.length - submittedIds.size}</strong>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <div className="empty-state">
            <div className="spinner" />
            <p>Đang tải danh sách đề tài cần chấm...</p>
          </div>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && assignedTheses.length === 0 && (
        <Card>
          <div className="empty-state">
            <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
            <h3>Không có đề tài chờ đánh giá</h3>
            <p>Moderator chưa phân công đề tài nào cho bạn trong đợt này.</p>
          </div>
        </Card>
      )}

      {/* Review Cards */}
      <div className="review-cards-list">
        {!isLoading && assignedTheses.map(assignment => {
          const topic = assignment.topic || assignment;
          const evalData = evaluations[assignment.id] || {};
          const isDone = submittedIds.has(assignment.id) || assignment.decision;
          const order = getOrderLabel(assignment.reviewerOrder);
          const busy = isSubmitting === assignment.id;

          // Lock R1 & R2 when topic needs a 3rd reviewer (they already voted, conflicted)
          const isLockedByR3 = topic.status === 'NEED_THIRD_REVIEWER' && assignment.reviewerOrder <= 2;

          return (
            <Card key={assignment.id} className={`review-card ${isDone ? 'card-done' : ''} ${isLockedByR3 ? 'card-locked' : ''}`}>
              {/* Header */}
              <div className="review-card-header">
                <div>
                  <span className="topic-code">{topic.code || `ID-${topic.id}`}</span>
                  <h3 className="topic-title">{topic.titleVi || topic.titleEn || 'N/A'}</h3>
                  <p className="topic-dept">
                    🏫 {topic.department || 'N/A'} &nbsp;·&nbsp; GVHD: {topic.supervisor?.fullName || 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className={`reviewer-badge ${order.cls}`}>{order.label}</div>
                  {isDone && <Badge variant="success">✓ Đã nộp</Badge>}
                  {isLockedByR3 && <Badge variant="error">🔒 Đang chờ GV3</Badge>}
                </div>
              </div>

              {/* Description */}
              {topic.description && (
                <p className="topic-desc">{topic.description}</p>
              )}

              {/* If already submitted: show result */}
              {assignment.decision && (
                <div className="submitted-result">
                  <span className={`decision-result ${assignment.decision === 'APPROVED' ? 'approved' : assignment.decision === 'CONSIDER' ? 'considered' : 'rejected'}`}>
                    {assignment.decision === 'APPROVED' ? '✓ APPROVED (Đạt)' : assignment.decision === 'CONSIDER' ? '🤔 CONSIDER (Cân nhắc)' : '✗ REJECTED (Không đạt)'}
                  </span>
                  {assignment.totalScore !== undefined && assignment.totalScore !== null && (
                    <span className="score-pill">Điểm: {assignment.totalScore}/10</span>
                  )}
                  {assignment.comment && (
                    <p className="result-comment">"{assignment.comment}"</p>
                  )}
                </div>
              )}

              {/* LOCKED: R1/R2 when topic needs R3 to tie-break */}
              {isLockedByR3 && (
                <div style={{
                  marginTop: 16, padding: '16px 20px', borderRadius: 10,
                  background: 'rgba(225,112,85,0.08)', border: '1.5px solid rgba(225,112,85,0.3)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>🔒</span>
                  <div>
                    <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#e17055', fontSize: 15 }}>
                      Đề tài đang chờ Reviewer thứ 3 chốt kết quả
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                      Ý kiến của 2 Reviewer đầu <strong>trái chiều nhau</strong> — hệ thống đã yêu cầu Moderator chỉ định Reviewer thứ 3 để chốt phán quyết cuối cùng.
                      Bạn <strong>không thể chỉnh sửa hoặc nộp lại</strong> đánh giá trong giai đoạn này.
                    </p>
                    {assignment.decision && (
                      <p style={{ marginTop: 8, fontSize: 13, color: '#888' }}>
                        Phán quyết của bạn:{' '}
                        <strong style={{ color: assignment.decision === 'APPROVED' ? '#00b894' : '#e17055' }}>
                          {assignment.decision}
                        </strong>
                        {assignment.totalScore != null ? ` — Điểm: ${assignment.totalScore}/10` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Eval Form — only show if not submitted and not locked */}
              {!assignment.decision && !isLockedByR3 && (
                <div className="eval-form">
                  {/* Decision */}
                  <div className="form-row">
                    <label className="form-label">
                      Quyết Định <span className="required">*</span>
                      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 'normal', color: '#888' }}>
                        (Tự động tính toán dựa trên số tiêu chí "Đạt (X)")
                      </span>
                    </label>
                    <div className="decision-btns">
                      <button
                        className={`decision-btn approved ${evalData.decision === 'APPROVED' ? 'active' : ''}`}
                        onClick={() => updateEval(assignment.id, 'decision', 'APPROVED')}
                        disabled={busy}
                      >
                        ✓ APPROVED (Đạt)
                      </button>
                      <button
                        className={`decision-btn consider ${evalData.decision === 'CONSIDER' ? 'active' : ''}`}
                        onClick={() => updateEval(assignment.id, 'decision', 'CONSIDER')}
                        disabled={busy}
                      >
                        🤔 CONSIDER (Cân nhắc)
                      </button>
                      <button
                        className={`decision-btn rejected ${evalData.decision === 'REJECTED' ? 'active' : ''}`}
                        onClick={() => updateEval(assignment.id, 'decision', 'REJECTED')}
                        disabled={busy}
                      >
                        ✗ REJECTED (Không đạt)
                      </button>
                    </div>
                    {/* Visual indicator of pass count */}
                    <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
                      Tổng số tiêu chí "Đạt (X)": <strong style={{color: Object.values(evalData.checklist || {}).filter(v => v === 'X').length >= 5 ? '#00b894' : '#e17055'}}>{Object.values(evalData.checklist || {}).filter(v => v === 'X').length} / 10</strong>
                      {' '} — {Object.values(evalData.checklist || {}).filter(v => v === 'X').length >= 5 ? 'Đề xuất: APPROVED' : 'Đề xuất: REJECTED'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="form-row">
                    <label className="form-label">Điểm (0 – 10) <span className="required">*</span></label>
                    <div className="score-row">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        className="score-input"
                        placeholder="VD: 8.5"
                        value={evalData.totalScore}
                        onChange={e => updateEval(assignment.id, 'totalScore', e.target.value)}
                        disabled={busy}
                      />
                      {evalData.totalScore !== '' && !isNaN(Number(evalData.totalScore)) && (
                        <span className={`score-preview ${Number(evalData.totalScore) >= 8 ? 'high' : Number(evalData.totalScore) >= 5 ? 'medium' : 'low'}`}>
                          {Number(evalData.totalScore)}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed Checklist Options */}
                  <div className="form-row">
                    <label className="form-label" style={{ fontSize: '15px', marginTop: '10px' }}>
                      Chi Tiết Đánh Giá Đề Tài (Checklist)
                    </label>
                    <div className="checklist-container" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { id: 'c1', label: '1. Tên đề tài (project title) có phản ánh được định hướng thực hiện nghiên cứu và phát triển sản phẩm của nhóm SV?' },
                        { id: 'c2', label: '2. Ngữ cảnh (context) nơi sản phẩm được triển khai có được xác định cụ thể?' },
                        { id: 'c3', label: '3. Vấn đề cần giải quyết (problem statement) có được mô tả rõ ràng là động lực cho việc ra đời của sản phẩm?' },
                        { id: 'c4', label: '4. Người dùng chính (main actors) có được xác định trong đề tài?' },
                        { id: 'c5', label: '5. Các luồng xử lý chính (main flows) và các chức năng chính (main use cases) của người dùng có được mô tả?' },
                        { id: 'c6', label: '6. Khách hàng/nhà tài trợ (customers/sponsors) của đề tài có được xác định?' },
                        { id: 'c7', label: '7. Lý thuyết (theory), công nghệ áp dụng (applied technology) và các sản phẩm cần tạo ra trong đề tài (main deliverables) có được xác định và phù hợp?' },
                        { id: 'c8', label: '8. Quy mô (size of product) có khả thi và phù hợp cho nhóm (3-5) SV thực hiện trong 14 tuần? Có phân chia thành các gói packages để đánh giá?' },
                        { id: 'c9', label: '9. Độ phức tạp và tính kỹ thuật (Complexity/technicality) của đề tài phù hợp với yêu cầu năng lực của 1 đề tài Capstone project cho ngành Kỹ thuật phần mềm?' },
                        { id: 'c10', label: '10. Đề tài xây dựng hướng đến việc giải quyết các vấn đề thực tế (Applicability) và khả thi về mặt công nghệ (technologically feasible) trong giới hạn thời gian của dự án?' }
                      ].map(item => (
                        <div key={item.id} className="checklist-item" style={{ marginBottom: '10px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ddd', lineHeight: '1.5' }}>{item.label}</p>
                          <div className="checklist-options" style={{ display: 'flex', gap: '8px' }}>
                            {/* Pass = X */}
                            <button
                              type="button"
                              onClick={() => updateChecklist(assignment.id, item.id, 'X')}
                              disabled={busy}
                              style={{
                                padding: '5px 18px', border: '1.5px solid', borderRadius: '6px',
                                fontSize: '13px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                background: evalData.checklist?.[item.id] === 'X' ? 'rgba(0,184,148,0.25)' : 'rgba(255,255,255,0.04)',
                                borderColor: evalData.checklist?.[item.id] === 'X' ? '#00b894' : 'rgba(255,255,255,0.12)',
                                color: evalData.checklist?.[item.id] === 'X' ? '#00b894' : '#888',
                              }}
                            >Pass (X)</button>
                            {/* Fail = O */}
                            <button
                              type="button"
                              onClick={() => updateChecklist(assignment.id, item.id, 'O')}
                              disabled={busy}
                              style={{
                                padding: '5px 18px', border: '1.5px solid', borderRadius: '6px',
                                fontSize: '13px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                background: evalData.checklist?.[item.id] === 'O' ? 'rgba(225,112,85,0.25)' : 'rgba(255,255,255,0.04)',
                                borderColor: evalData.checklist?.[item.id] === 'O' ? '#e17055' : 'rgba(255,255,255,0.12)',
                                color: evalData.checklist?.[item.id] === 'O' ? '#e17055' : '#888',
                              }}
                            >Fail (O)</button>
                            {/* N/A */}
                            <button
                              type="button"
                              onClick={() => updateChecklist(assignment.id, item.id, 'N/A')}
                              disabled={busy}
                              style={{
                                padding: '5px 18px', border: '1.5px solid', borderRadius: '6px',
                                fontSize: '13px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                background: evalData.checklist?.[item.id] === 'N/A' ? 'rgba(253,203,110,0.2)' : 'rgba(255,255,255,0.04)',
                                borderColor: evalData.checklist?.[item.id] === 'N/A' ? '#fdcb6e' : 'rgba(255,255,255,0.12)',
                                color: evalData.checklist?.[item.id] === 'N/A' ? '#fdcb6e' : '#888',
                              }}
                            >N/A</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="form-row">
                    <label className="form-label" style={{ marginTop: '10px' }}>Nhận Xét / Đánh Giá (Bắt buộc nếu Consider hoặc Reject)</label>
                    <textarea
                      className="comment-input"
                      rows={4}
                      placeholder="Nhập nhận xét chi tiết, chỉ ra các điểm cần sửa..."
                      value={evalData.comment}
                      onChange={e => updateEval(assignment.id, 'comment', e.target.value)}
                      disabled={busy}
                    />
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="primary"
                      onClick={() => handleSubmit(assignment)}
                      disabled={busy || !evalData.decision}
                    >
                      {busy ? '⏳ Đang nộp...' : '💾 Nộp Đánh Giá'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LecturerReviews;
