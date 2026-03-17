import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import thesisService from '../../services/thesisService.js';
import api from '../../utils/axios.js';
import { showError } from '../../utils/alert.js';
import { useNavigate } from 'react-router-dom';
import '../student-theses/student-theses.css';

const RUBRIC_CRITERIA = {
  c1: 'Đã hoàn thành các yêu cầu cơ bản của đề tài',
  c2: 'Có tìm hiểu và áp dụng công nghệ phù hợp',
  c3: 'Có sản phẩm demo/chạy được',
  c4: 'Kiến trúc/thiết kế hệ thống hợp lý',
  c5: 'Giao diện người dùng (nếu có) thân thiện, dễ sử dụng',
  c6: 'Mã nguồn rõ ràng, có tổ chức, dễ bảo trì',
  c7: 'Có tài liệu (báo cáo, slide) đầy đủ, trình bày tốt',
  c8: 'Hoàn thành đúng tiến độ',
  c9: 'Thái độ làm việc tích cực, chuyên nghiệp',
  c10: 'Đề tài có tính ứng dụng thực tiễn hoặc sáng tạo'
};

const STATUS_MAP = {
  'PENDING': 'Đang chờ duyệt',
  'WAITING_MODERATOR': 'Đang đợi Moderator',
  'WATTING_MODERATOR': 'Đang đợi Moderator',
  'IN_REVIEW': 'Đang phản biện',
  'NEED_THIRD_REVIEWER': 'Cần phản biện 3',
  'CONSIDER': 'Cân nhắc',
  'APPROVED': 'Đã duyệt',
  'PASS': 'Đã đạt',
  'REJECTED': 'Bị từ chối',
  'FAIL': 'Không đạt',
  'FINALIZED': 'Đã hoàn thành'
};

const StudentMyThesis = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods } = usePeriodStore();
  const navigate = useNavigate();

  const [theses, setTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Review details modal state
  const [selectedThesisForReview, setSelectedThesisForReview] = useState(null);
  const [reviewDetails, setReviewDetails] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    loadMyTheses();
    loadSemesterData();
  }, []);

  const loadSemesterData = async () => {
    const activeInfo = await fetchActiveSemester();
    if (activeInfo) {
      await fetchOpenPeriods(activeInfo.id);
    }
  };

  const loadMyTheses = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;

      const topics = await thesisService.getTopicsBySubmitter(user.id);

      if (topics && Array.isArray(topics)) {
        setTheses(topics);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin đề tài:', error);
      showError('Không thể tải thông tin đề tài của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRejectionDetails = async (thesis) => {
    setSelectedThesisForReview(thesis);
    setIsReviewModalOpen(true);
    setIsLoadingReviews(true);
    try {
      // Fetch reviews for this topic using the generic topic-reviewers API
      const response = await api.get(`/api/topic-reviewers/topic/${thesis.id}`);
      if (response && response.data) {
        setReviewDetails(response.data);
      } else {
        setReviewDetails([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đánh giá:', error);
      showError('Không thể tải lý do từ chối.');
      setReviewDetails([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const parseChecklist = (jsonStr) => {
    try {
      if (!jsonStr) return null;
      return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    } catch (e) {
      console.error('Error parsing checklist:', e);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="student-theses">
        <div className="page-header">
          <h1>Đề Tài Của Tôi</h1>
          <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
        </div>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        </Card>
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="student-theses">
        <div className="page-header">
          <h1>Đề Tài Của Tôi</h1>
          <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
        </div>
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Bạn chưa có Đề Tài nào!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Bạn chưa nộp đề tài nào hoặc hệ thống chưa ghi nhận. Vui lòng chuyển sang trang <strong>Đăng ký Đề Tài</strong> để tiến hành nộp biểu mẫu.
            </p>
            <Button variant="primary" onClick={() => navigate('/student/theses')}>Đến trang Đăng ký Đề Tài</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="student-my-thesis">
      <div className="page-header">
        <div>
          <h1>📖 Đề Tài Của Tôi</h1>
          <p className="page-subtitle">Xem thông tin và trạng thái đề tài bạn đã đăng ký</p>
        </div>
        <Button variant="outline" onClick={loadMyTheses}>
          🔄 Làm mới
        </Button>
      </div>

      <div className="thesis-list">
        {theses.map(t => {
          const thesisDetail = t.topic || t;
          
          return (
            <Card key={thesisDetail.id} style={{ marginBottom: '20px' }}>
              <div className="thesis-detail-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>
                    {thesisDetail.titleVi}
                  </h3>
                  <Badge variant={
                    ['APPROVED', 'PASS'].includes(thesisDetail.status) ? 'success' :
                    ['REJECTED', 'FAIL'].includes(thesisDetail.status) ? 'error' : 'warning'
                  }>
                    {STATUS_MAP[thesisDetail.status] || thesisDetail.status}
                  </Badge>
                </div>

                {thesisDetail.titleEn && (
                  <p style={{ color: 'var(--text-secondary)', marginTop: '-10px', marginBottom: '20px', fontStyle: 'italic' }}>
                    {thesisDetail.titleEn}
                  </p>
                )}

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã đề tài</span>
                    <span className="detail-value" style={{ fontWeight: 'bold' }}>{thesisDetail.code || 'Chưa cấp'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bộ môn / Ngành</span>
                    <span className="detail-value">{thesisDetail.department || 'Chưa phân công'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Giảng viên hướng dẫn</span>
                    <span className="detail-value">{thesisDetail.supervisor?.fullName || 'Chưa phân công'}</span>
                  </div>
                  
                  {thesisDetail.description && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Mô tả</span>
                      <p style={{ marginTop: '8px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                        {thesisDetail.description}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '30px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Kết quả Đăng ký Đề tài</h4>
                  {thesisDetail.status === 'REJECTED' || thesisDetail.status === 'FAIL' ? (
                    <div>
                      <p style={{ color: 'var(--text-danger)', marginBottom: '15px' }}>
                        Đề tài của bạn đã bị từ chối. Bạn không thể nộp lại đề tài trong cùng đợt đăng ký này.
                      </p>
                      {thesisDetail.finalNote && (
                        <p style={{ fontStyle: 'italic', marginBottom: '15px', borderLeft: '3px solid #e17055', paddingLeft: '10px' }}>
                          Ghi chú: {thesisDetail.finalNote}
                        </p>
                      )}
                      <Button variant="danger" onClick={() => handleViewRejectionDetails(thesisDetail)}>
                        Xem lý do chi tiết từ Hội đồng
                      </Button>
                    </div>
                  ) : thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS' ? (
                    <p>Đề tài của bạn đã được phê duyệt thành công!</p>
                  ) : (
                    <p>
                      Đề tài của bạn đã được hệ thống ghi nhận.
                      Đang trong quá trình chờ phê duyệt bởi Hội đồng chuyên môn (Moderator).
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Chi tiết đánh giá Đề tài`}
      >
        <div style={{ padding: '0 5px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
            {selectedThesisForReview?.titleVi || 'Tên đề tài'}
          </h4>
          
          {isLoadingReviews ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              Đang tải nhận xét...
            </div>
          ) : reviewDetails.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p>Chưa có thông tin nhận xét chi tiết.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviewDetails.map((review, detailIdx) => {
                const checklistObj = parseChecklist(review.checklistDetails);
                
                return (
                  <div key={review.id || detailIdx} style={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#0984e3', fontSize: '13px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          Phản biện {review.reviewerOrder}
                        </span>
                        <div style={{ fontWeight: 600, marginTop: '8px', fontSize: '16px' }}>
                          {review.reviewer?.fullName || 'Giảng viên ẩn danh'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '8px' }}>
                          {review.decision === 'REJECTED' || review.decision === 'FAIL' ? (
                             <Badge variant="error" style={{ fontSize: '13px', padding: '6px 10px' }}>✗ KHÔNG ĐẠT</Badge>
                          ) : review.decision === 'CONSIDER' ? (
                             <Badge variant="warning" style={{ fontSize: '13px', padding: '6px 10px' }}>🤔 CÂN NHẮC</Badge>
                          ) : review.decision === 'APPROVED' || review.decision === 'PASS' ? (
                             <Badge variant="success" style={{ fontSize: '13px', padding: '6px 10px' }}>✓ ĐẠT</Badge>
                          ) : (
                             <Badge variant="default" style={{ fontSize: '13px', padding: '6px 10px' }}>ĐANG CHỜ</Badge>
                          )}
                        </div>
                        {review.totalScore !== undefined && review.totalScore !== null && (
                           <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                             Điểm: <span style={{ color: review.totalScore >= 5 ? '#00b894' : '#d63031', fontSize: '18px' }}>{review.totalScore}</span> <span style={{fontSize: '13px'}}>/ 10</span>
                           </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Rubric Checklist Display */}
                    {checklistObj && Object.keys(checklistObj).length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Đánh giá chi tiết (Rubric):</strong>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'minmax(0, 1fr)', 
                          gap: '8px',
                          background: 'rgba(0,0,0,0.03)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                          {Object.keys(RUBRIC_CRITERIA).map(criterionKey => {
                            const isChecked = checklistObj[criterionKey] === 'X';
                            return (
                              <div key={criterionKey} style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: '10px',
                                padding: '6px 8px',
                                background: isChecked ? 'rgba(0, 184, 148, 0.05)' : 'rgba(214, 48, 49, 0.05)',
                                borderRadius: '6px',
                                fontSize: '13.5px'
                              }}>
                                <span style={{ 
                                  color: isChecked ? '#00b894' : '#d63031',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: '2px',
                                  background: isChecked ? 'rgba(0, 184, 148, 0.15)' : 'rgba(214, 48, 49, 0.1)',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  flexShrink: 0  
                                }}>
                                  {isChecked ? '✓' : '✗'}
                                </span>
                                <span style={{ 
                                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  textDecoration: isChecked ? 'none' : 'line-through',
                                  opacity: isChecked ? 1 : 0.8
                                }}>
                                  {RUBRIC_CRITERIA[criterionKey]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      background: 'rgba(0,0,0,0.05)', 
                      padding: '15px', 
                      borderRadius: '8px',
                      borderLeft: review.decision === 'REJECTED' || review.decision === 'FAIL' ? '4px solid #e17055' : '4px solid #0984e3'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Nhận xét chung:</strong>
                      <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {review.comment || <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>(Không có nhận xét chi tiết)</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentMyThesis;
