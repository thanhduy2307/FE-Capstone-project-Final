import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import moderatorService from '../../services/moderatorService.js';
import api from '../../utils/axios.js';
import './moderator-third-reviewer.css';

const ModeratorThirdReviewer = () => {
  const [topics, setTopics] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [topicsRes, reviewersRes] = await Promise.all([
        api.get('/api/topic-reviewers/need-third-reviewer').catch(() => ({ data: [] })),
        moderatorService.getAvailableReviewers().catch(() => [])
      ]);

      const topicsList = Array.isArray(topicsRes.data) ? topicsRes.data : (topicsRes.data?.data || []);
      const reviewersList = Array.isArray(reviewersRes) ? reviewersRes : (reviewersRes.data || []);

      setTopics(topicsList);
      setAvailableReviewers(reviewersList);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (topic) => {
    setSelectedTopic(topic);
    setSelectedReviewer(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedReviewer) {
      alert('Vui lòng chọn 1 Giảng viên làm Reviewer thứ 3');
      return;
    }
    try {
      setIsSubmitting(true);
      const topicId = selectedTopic.topicId || selectedTopic.id;
      await moderatorService.assignThirdReviewer(topicId, selectedReviewer);
      alert('Phân công Reviewer thứ 3 thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error('Error assigning third reviewer:', e);
      alert('Có lỗi xảy ra khi phân công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="moderator-third-reviewer">
      <div className="page-header">
        <div>
          <h1>Đề Tài Cần Reviewer Thứ 3</h1>
          <p className="page-subtitle">Danh sách đề tài có kết quả trái chiều từ 2 Reviewer đầu tiên, cần người chốt</p>
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={isLoading}>
          🔄 Làm mới
        </button>
      </div>

      <Card>
        {isLoading ? (
          <div className="loading-state">Đang tải danh sách...</div>
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Không có đề tài nào đang tranh cãi</h3>
            <p>Tất cả đề tài đang có kết quả đồng thuận từ 2 Reviewer</p>
          </div>
        ) : (
          <table className="third-reviewer-table">
            <thead>
              <tr>
                <th>Mã Đề Tài</th>
                <th>Tên Đề Tài</th>
                <th>Chuyên Ngành</th>
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
                    <td><strong>{topic.code || `ID-${topic.id}`}</strong></td>
                    <td>{topic.titleVi || topic.titleEn || 'N/A'}</td>
                    <td>{topic.department || 'N/A'}</td>
                    <td>
                      {item.reviewer1Decision
                        ? <Badge variant={item.reviewer1Decision === 'APPROVED' ? 'success' : 'error'}>{item.reviewer1Name || 'R1'}: {item.reviewer1Decision}</Badge>
                        : 'N/A'}
                    </td>
                    <td>
                      {item.reviewer2Decision
                        ? <Badge variant={item.reviewer2Decision === 'APPROVED' ? 'success' : 'error'}>{item.reviewer2Name || 'R2'}: {item.reviewer2Decision}</Badge>
                        : 'N/A'}
                    </td>
                    <td>
                      <button className="action-btn assign-btn" onClick={() => handleOpenModal(item)}>
                        Phân Công GV3
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Phân Công Reviewer Thứ 3 (Chốt điểm)" size="lg">
        {selectedTopic && (
          <div className="assign-form">
            <div className="topic-info">
              <h4>{(selectedTopic.topic || selectedTopic).titleVi || (selectedTopic.topic || selectedTopic).titleEn}</h4>
              <p style={{ color: '#e17055', fontWeight: 600, marginTop: '6px' }}>
                ⚠️ Đề tài có 2 ý kiến trái chiều — cần Reviewer thứ 3 để chốt kết quả cuối.
              </p>
            </div>

            <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Chọn 1 Giảng viên uy tín (chỉ chọn 1)</p>
            <div className="reviewer-grid">
              {availableReviewers.map(reviewer => (
                <div
                  key={reviewer.id}
                  className={`reviewer-card ${selectedReviewer === reviewer.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReviewer(reviewer.id)}
                >
                  <div className="reviewer-avatar" style={{ backgroundColor: '#e17055' }}>
                    {reviewer.fullName?.charAt(0) || 'G'}
                  </div>
                  <div className="reviewer-info">
                    <div className="r-name">{reviewer.fullName}</div>
                    <div className="r-email">{reviewer.email}</div>
                  </div>
                  {selectedReviewer === reviewer.id && <div className="r-check" style={{ color: '#e17055' }}>✓</div>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}
                style={{ backgroundColor: '#e17055', borderColor: '#e17055' }}>
                {isSubmitting ? 'Đang Lưu...' : 'Phân Công GV3'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModeratorThirdReviewer;
