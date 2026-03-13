import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Table from '../../components/Table.jsx';
import moderatorService from '../../services/moderatorService.js';
import './moderator-theses.css';

const ModeratorTheses = () => {
  const [theses, setTheses] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isThirdAssignModalOpen, setIsThirdAssignModalOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);

  // Selected State
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [selectedThirdReviewer, setSelectedThirdReviewer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [topicsRes, reviewersRes] = await Promise.all([
        moderatorService.getAllTopics(),
        moderatorService.getAvailableReviewers()
      ]);
      
      const topicsData = Array.isArray(topicsRes) ? topicsRes : (topicsRes.data || []);
      const reviewersData = Array.isArray(reviewersRes) ? reviewersRes : (reviewersRes.data || []);
      
      setTheses(topicsData);
      setAvailableReviewers(reviewersData);
      
    } catch (error) {
      console.error("Error fetching moderator data:", error);
      alert("Lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAssignModal = (thesis) => {
    setSelectedThesis(thesis);
    setSelectedReviewers([]); // Reset selection when opening modal
    setIsAssignModalOpen(true);
  };

  const handleOpenThirdAssignModal = (thesis) => {
    setSelectedThesis(thesis);
    setSelectedThirdReviewer(null); // Reset selection
    setIsThirdAssignModalOpen(true);
  };

  const handleToggleReviewer = (reviewerId) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        return prev.filter(r => r !== reviewerId);
      }
      if (prev.length >= 2) {
        alert("Chỉ được phân công tối đa 2 người chấm chính!");
        return prev;
      }
      return [...prev, reviewerId];
    });
  };

  const handleSubmitAssign = async () => {
    if (selectedReviewers.length < 2) {
      alert("Vui lòng chọn đủ 2 Giảng viên phản biện (Reviewer)");
      return;
    }
    
    try {
      setIsLoading(true);
      await moderatorService.assignReviewers(selectedThesis.id, selectedReviewers);
      alert("Phân công Giảng viên phản biện thành công!");
      setIsAssignModalOpen(false);
      fetchData(); // Refresh list to get updated status
    } catch (error) {
       console.error("Error assigning reviewers:", error);
       alert("Có lỗi xảy ra khi phân công Giảng viên. Vui lòng thử lại.");
    } finally {
       setIsLoading(false);
    }
  };

  const handleSubmitThirdAssign = async () => {
    if (!selectedThirdReviewer) {
      alert("Vui lòng chọn 1 Giảng viên làm Reviewer thứ 3");
      return;
    }
    
    try {
      setIsLoading(true);
      await moderatorService.assignThirdReviewer(selectedThesis.id, selectedThirdReviewer);
      alert("Phân công Reviewer thứ 3 thành công!");
      setIsThirdAssignModalOpen(false);
      fetchData();
    } catch (error) {
       console.error("Error assigning third reviewer:", error);
       alert("Có lỗi xảy ra khi phân công. Vui lòng thử lại.");
    } finally {
       setIsLoading(false);
    }
  };


  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_REVIEW': return 'info';
      case 'CONSIDER': return 'warning';
      case 'NEED_THIRD_REVIEWER': return 'error';
      case 'PASS': return 'success';
      case 'FAIL': return 'error';
      case 'LOCKED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ phân công GV';
      case 'IN_REVIEW': return 'Đang trong hội đồng';
      case 'CONSIDER': return 'Xem xét thêm';
      case 'NEED_THIRD_REVIEWER': return 'Cần GV thứ 3';
      case 'PASS': return 'Đã duyệt (Pass)';
      case 'FAIL': return 'Không đạt (Fail)';
      case 'LOCKED': return 'Đã khóa';
      default: return status || 'N/A';
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Mã Đề Tài',
      render: (value, row) => <span style={{ fontWeight: 600, color: value ? 'inherit' : '#888' }}>{row.code || `ID-${row.id}`}</span>,
    },
    { 
      key: 'title', 
      label: 'Tên Đề Tài',
      render: (_, row) => row.titleVi || row.titleEn || 'N/A'
    },
    { 
      key: 'department', 
      label: 'Chuyên Ngành',
      render: (_, row) => row.department || 'N/A' 
    },
    { 
      key: 'supervisorName', 
      label: 'Giảng Viên HD',
      render: (_, row) => row.supervisor?.fullName || 'N/A'
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (value) => <Badge variant={getStatusVariant(value)}>{getStatusText(value)}</Badge>,
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (_, row) => (
        <div className="action-buttons">
            {row.status === 'NEED_THIRD_REVIEWER' ? (
                <button className="action-btn ai-btn" onClick={() => handleOpenThirdAssignModal(row)}>Phân Công GV3</button>
            ) : (
                <button className="action-btn assign-btn" onClick={() => handleOpenAssignModal(row)} disabled={['IN_REVIEW','PASS','FAIL','LOCKED'].includes(row.status)}>Phân Công Reviewer</button>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="moderator-theses">
      <div className="page-header">
        <div>
          <h1>Quản Lý Đề Tài Được Nộp</h1>
          <p className="page-subtitle">Cấp mã số đề tài, kiểm tra đạo văn AI và phân công người chấm (Reviewers)</p>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={theses} emptyMessage={isLoading ? "Đang tải dữ liệu..." : "Chưa có đề tài nào"} />
      </Card>

      {/* Assign Reviewer Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Phân Công Reviewer Chấm Thi" size="lg">
         {selectedThesis && (
           <div className="assign-form">
               <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#333', marginBottom: '8px' }}>{selectedThesis.titleVi || selectedThesis.titleEn}</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Giảng viên Hướng Dẫn: <strong>{selectedThesis.supervisor?.fullName || 'N/A'}</strong></p>
               </div>
               
               <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Chọn đúng 2 Giảng viên phản biện (Đã chọn: {selectedReviewers.length}/2)</p>

               <div className="reviewer-grid">
                  {availableReviewers.map(reviewer => (
                     <div 
                        key={reviewer.id} 
                        className={`reviewer-card ${selectedReviewers.includes(reviewer.id) ? 'selected' : ''}`}
                        onClick={() => handleToggleReviewer(reviewer.id)}
                     >
                        <div className="reviewer-avatar">{reviewer.fullName?.charAt(0) || 'G'}</div>
                        <div className="reviewer-info">
                           <div className="r-name">{reviewer.fullName}</div>
                           <div className="r-email">{reviewer.email}</div>
                        </div>
                        {selectedReviewers.includes(reviewer.id) && (
                           <div className="r-check">✓</div>
                        )}
                     </div>
                  ))}
               </div>

               <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                 <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
                 <Button variant="primary" onClick={handleSubmitAssign} disabled={isLoading}>
                    {isLoading ? 'Đang Lưu...' : 'Lưu Phân Công'}
                 </Button>
               </div>
           </div>
         )}
      </Modal>

      {/* Assign Third Reviewer Modal */}
      <Modal isOpen={isThirdAssignModalOpen} onClose={() => setIsThirdAssignModalOpen(false)} title="Phân Công Reviewer Số 3 (Chốt điểm)" size="lg">
         {selectedThesis && (
           <div className="assign-form">
               <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#333', marginBottom: '8px' }}>{selectedThesis.titleVi || selectedThesis.titleEn}</h4>
                  <p style={{ color: '#e74c3c', fontSize: '14px', fontWeight: 'bold' }}>Đề tài này đang có kết quả trái chiều từ 2 Reviewer đầu tiên.</p>
               </div>
               
               <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Chọn 1 Giảng viên uy tín làm Reviewer thứ 3 để chốt kết quả</p>

               <div className="reviewer-grid">
                  {availableReviewers.map(reviewer => (
                     <div 
                        key={reviewer.id} 
                        className={`reviewer-card ${selectedThirdReviewer === reviewer.id ? 'selected' : ''}`}
                        onClick={() => setSelectedThirdReviewer(reviewer.id)}
                     >
                        <div className="reviewer-avatar" style={{backgroundColor: '#e74c3c'}}>{reviewer.fullName?.charAt(0) || 'G'}</div>
                        <div className="reviewer-info">
                           <div className="r-name">{reviewer.fullName}</div>
                           <div className="r-email">{reviewer.email}</div>
                        </div>
                        {selectedThirdReviewer === reviewer.id && (
                           <div className="r-check" style={{color: '#e74c3c'}}>✓</div>
                        )}
                     </div>
                  ))}
               </div>

               <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                 <Button variant="outline" onClick={() => setIsThirdAssignModalOpen(false)}>Hủy</Button>
                 <Button variant="primary" onClick={handleSubmitThirdAssign} disabled={isLoading} style={{backgroundColor: '#e74c3c', borderColor: '#e74c3c'}}>
                    {isLoading ? 'Đang Lưu...' : 'Phân Công GV 3'}
                 </Button>
               </div>
           </div>
         )}
      </Modal>

    </div>
  );
};

export default ModeratorTheses;
