import React, { useState } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Table from '../../components/Table.jsx';
import './moderator-theses.css';

const MOCK_THESES = [
  {
    id: 1,
    code: null,
    title: 'Phát triển ứng dụng AI cho giao thông',
    department: 'AI',
    supervisorName: 'PGS.TS Nguyễn Văn A',
    status: 'pending_code', // waiting for moderator to assign code
    aiCheckPassed: null,
    reviewers: []
  },
  {
    id: 2,
    code: 'DT2024002',
    title: 'Quản lý kho hàng với ERP',
    department: 'SE',
    supervisorName: 'TS Lê C',
    status: 'pending_ai', // got code, needs AI check
    aiCheckPassed: null,
    reviewers: []
  },
  {
    id: 3,
    code: 'DT2024003',
    title: 'Hệ thống đánh giá tự động đa ngôn ngữ',
    department: 'SE',
    supervisorName: 'TS Lê D',
    status: 'pending_assign', // safe from AI, waiting for reviewers
    aiCheckPassed: true,
    reviewers: []
  },
  {
    id: 4,
    code: 'DT2024004',
    title: 'Hệ thống nhận diện khuôn mặt',
    department: 'AI',
    supervisorName: 'PGS.TS Nguyễn Thị H',
    status: 'assigned', // fully assigned
    aiCheckPassed: true,
    reviewers: ['HuongNTC2', 'PhuongLHK']
  }
];

const MOCK_REVIEWERS = [
  { id: '1', name: 'HuongNTC2', email: 'huongntc2@fpt.edu.vn' },
  { id: '2', name: 'PhuongLHK', email: 'phuonglhk@fpt.edu.vn' },
  { id: '3', name: 'KhanhKT', email: 'khanhkt@fpt.edu.vn' },
  { id: '4', name: 'TaiNT51', email: 'taint51@fpt.edu.vn' },
];

const ModeratorTheses = () => {
  const [theses, setTheses] = useState(MOCK_THESES);
  
  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);

  // States for actions
  const [inputCode, setInputCode] = useState('');
  const [isAIChecking, setIsAIChecking] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  // ---- Handlers ----
  const handleOpenCodeModal = (thesis) => {
    setSelectedThesis(thesis);
    setInputCode(thesis.department === 'AI' ? 'AI20240' : 'SE20240');
    setIsCodeModalOpen(true);
  };

  const handleSubmitCode = () => {
    if (!inputCode.trim()) {
      alert("Mã đề tài không được để trống");
      return;
    }
    setTheses(prev => prev.map(t => t.id === selectedThesis.id ? { ...t, code: inputCode, status: 'pending_ai' } : t));
    setIsCodeModalOpen(false);
  };

  const handleOpenAIModal = (thesis) => {
    setSelectedThesis(thesis);
    setIsAIModalOpen(true);
    setIsAIChecking(false);
  };

  const handleRunAiCheck = () => {
    setIsAIChecking(true);
    setTimeout(() => {
      setIsAIChecking(false);
      const isDuplicate = Math.random() > 0.8; // 20% chance of failing
      setTheses(prev => prev.map(t => {
        if (t.id === selectedThesis.id) {
          return {
            ...t,
            aiCheckPassed: !isDuplicate,
            status: !isDuplicate ? 'pending_assign' : 'ai_failed'
          };
        }
        return t;
      }));
      setIsAIModalOpen(false);
      alert(isDuplicate ? 'Cảnh báo: Đề tài này có phần lớn nội dung trùng lặp với đồ án cũ!' : 'Kiểm tra thành công: Không phát hiện trùng lặp đáng kể.');
    }, 2000); // simulate 2s check
  };

  const handleOpenAssignModal = (thesis) => {
    setSelectedThesis(thesis);
    setSelectedReviewers(thesis.reviewers.length ? thesis.reviewers : []);
    setIsAssignModalOpen(true);
  };

  const handleToggleReviewer = (reviewerName) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerName)) {
        return prev.filter(r => r !== reviewerName);
      }
      if (prev.length >= 2) {
        alert("Chỉ được phân công tối đa 2 người chấm chính!");
        return prev;
      }
      return [...prev, reviewerName];
    });
  };

  const handleSubmitAssign = () => {
    if (selectedReviewers.length < 2) {
      alert("Vui lòng chọn đủ 2 Giảng viên phản biện (Reviewer)");
      return;
    }
    setTheses(prev => prev.map(t => t.id === selectedThesis.id ? { ...t, reviewers: selectedReviewers, status: 'assigned' } : t));
    setIsAssignModalOpen(false);
  };


  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending_code': return 'warning';
      case 'pending_ai': return 'info';
      case 'pending_assign': return 'success';
      case 'ai_failed': return 'error';
      case 'assigned': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_code': return 'Chờ cấp mã';
      case 'pending_ai': return 'Chờ AI Check';
      case 'pending_assign': return 'Chờ phân công GV';
      case 'ai_failed': return 'Trùng lặp (AI Reject)';
      case 'assigned': return 'Đã phân công duyệt';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Mã Đề Tài',
      render: (value) => <span style={{ fontWeight: 600, color: value ? 'inherit' : '#888' }}>{value || 'Chưa cấp mã'}</span>,
    },
    { key: 'title', label: 'Tên Đề Tài' },
    { key: 'department', label: 'Chuyên Ngành' },
    { key: 'supervisorName', label: 'Giảng Viên HD' },
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
          {row.status === 'pending_code' && (
            <button className="action-btn code-btn" onClick={() => handleOpenCodeModal(row)}>Cấp Mã</button>
          )}
          {row.status === 'pending_ai' && (
             <button className="action-btn ai-btn" onClick={() => handleOpenAIModal(row)}>Cảnh Báo Chống Vi Phạm (AI)</button>
          )}
          {(row.status === 'pending_assign' || row.status === 'assigned') && (
            <button className="action-btn assign-btn" onClick={() => handleOpenAssignModal(row)}>Phân Công Reviewer</button>
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
        <Table columns={columns} data={theses} emptyMessage="Chưa có đề tài nào" />
      </Card>

      {/* Code Modal */}
      <Modal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} title="Cấp Mã Đề Tài Mới">
        <div className="form-group">
          <label>Mã Đề Tài Sinh Viên:</label>
          <Input 
             value={inputCode} 
             onChange={e => setInputCode(e.target.value)}
             placeholder="Nhập mã đề tài..."
          />
          <p style={{marginTop: '8px', fontSize: '13px', color: '#888'}}>Mã này sẽ là định danh duy nhất cho đồ án của sinh viên trên hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
             <Button variant="outline" onClick={() => setIsCodeModalOpen(false)}>Hủy</Button>
             <Button variant="primary" onClick={handleSubmitCode}>Xác Nhận Cấp Mã</Button>
        </div>
      </Modal>

      {/* AI Check Modal */}
      <Modal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} title="AI Checker">
        {selectedThesis && (
          <div className="ai-check-container">
            <h4>{selectedThesis.title}</h4>
            <p>Sử dụng AI để đối chiếu nội dung đồ án này với kho dữ liệu đồ án cũ, nhằm phát hiện sao chép hoặc trùng lặp ý tưởng.</p>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
               {isAIChecking ? (
                  <div className="ai-loading">
                     <div className="spinner"></div>
                     <p>AI đang quét kho dữ liệu...</p>
                  </div>
               ) : (
                  <Button variant="primary" onClick={handleRunAiCheck}>Bắt Đầu Quét AI</Button>
               )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Reviewer Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Phân Công Reviewer Chấm Thi" size="lg">
         {selectedThesis && (
           <div className="assign-form">
               <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#333', marginBottom: '8px' }}>{selectedThesis.title}</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Giảng viên Hướng Dẫn: <strong>{selectedThesis.supervisorName}</strong></p>
               </div>
               
               <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Chọn đúng 2 Giảng viên phản biện (Đã chọn: {selectedReviewers.length}/2)</p>

               <div className="reviewer-grid">
                  {MOCK_REVIEWERS.map(reviewer => (
                     <div 
                        key={reviewer.id} 
                        className={`reviewer-card ${selectedReviewers.includes(reviewer.name) ? 'selected' : ''}`}
                        onClick={() => handleToggleReviewer(reviewer.name)}
                     >
                        <div className="reviewer-avatar">{reviewer.name.charAt(0)}</div>
                        <div className="reviewer-info">
                           <div className="r-name">{reviewer.name}</div>
                           <div className="r-email">{reviewer.email}</div>
                        </div>
                        {selectedReviewers.includes(reviewer.name) && (
                           <div className="r-check">✓</div>
                        )}
                     </div>
                  ))}
               </div>

               <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                 <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
                 <Button variant="primary" onClick={handleSubmitAssign}>Lưu Phân Công</Button>
               </div>
           </div>
         )}
      </Modal>

    </div>
  );
};

export default ModeratorTheses;
