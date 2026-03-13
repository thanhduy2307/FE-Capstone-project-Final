import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Table from '../../components/Table.jsx';
import useSupervisorStore from '../../stores/supervisorStore.js';
import { showSuccess, showError, showInfo } from '../../utils/alert.js';
import './supervisor-theses.css';

const SupervisorTheses = () => {
  const { myTheses, sendToCoordinator } = useSupervisorStore();
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [coordinatorNote, setCoordinatorNote] = useState('');

  // Mock data
  const theses = [
    {
      id: 1,
      title: 'Ứng dụng Machine Learning trong phân tích dữ liệu',
      studentName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      studentEmail: 'nguyenvana@student.edu.vn',
      submittedDate: '2024-01-30',
      status: 'pending',
      fileName: 'detai_SV001.pdf',
      fileSize: '2.5 MB',
      description: 'Nghiên cứu ứng dụng các thuật toán Machine Learning trong việc phân tích và dự đoán dữ liệu...',
    },
    {
      id: 2,
      title: 'Xây dựng hệ thống quản lý bằng Blockchain',
      studentName: 'Lê Thị C',
      studentCode: 'SV002',
      studentEmail: 'lethic@student.edu.vn',
      submittedDate: '2024-01-29',
      status: 'sent_to_coordinator',
      fileName: 'detai_SV002.docx',
      fileSize: '1.8 MB',
      description: 'Xây dựng hệ thống quản lý sử dụng công nghệ Blockchain để đảm bảo tính minh bạch...',
    },
    {
      id: 3,
      title: 'Phát triển ứng dụng IoT cho Smart Home',
      studentName: 'Hoàng Văn E',
      studentCode: 'SV003',
      studentEmail: 'hoangvane@student.edu.vn',
      submittedDate: '2024-01-28',
      status: 'reviewed',
      fileName: 'detai_SV003.pdf',
      fileSize: '3.2 MB',
      description: 'Phát triển ứng dụng IoT để điều khiển và giám sát các thiết bị trong nhà thông minh...',
    },
  ];

  const handleViewDetail = (thesis) => {
    setSelectedThesis(thesis);
    setIsDetailModalOpen(true);
  };

  const handleDownloadFile = (thesis) => {
    // Mock download - in production, this would call the API
    showInfo(`Đang tải file: ${thesis.fileName}`);
    // window.open(thesis.fileUrl, '_blank');
  };

  const handleOpenSendModal = (thesis) => {
    setSelectedThesis(thesis);
    setCoordinatorNote('');
    setIsSendModalOpen(true);
  };

  const handleSendToCoordinator = async () => {
    if (!selectedThesis) return;

    try {
      // await sendToCoordinator(selectedThesis.id, coordinatorNote);
      showSuccess(`Đã gửi đề tài "${selectedThesis.title}" cho người điều phối!`);
      setIsSendModalOpen(false);
      setCoordinatorNote('');
    } catch (error) {
      showError('Gửi đề tài thất bại!');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'sent_to_coordinator':
        return 'success';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xem xét';
      case 'reviewed':
        return 'Đã xem';
      case 'sent_to_coordinator':
        return 'Đã gửi';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const columns = [
    {
      key: 'studentCode',
      label: 'Mã SV',
      sortable: true,
    },
    {
      key: 'studentName',
      label: 'Sinh Viên',
      sortable: true,
    },
    {
      key: 'title',
      label: 'Tên Đề Tài',
      sortable: true,
    },
    {
      key: 'fileName',
      label: 'File',
      render: (value, row) => (
        <div className="file-cell">
          <span className="file-name">📎 {value}</span>
          <span className="file-size">{row.fileSize}</span>
        </div>
      ),
    },
    {
      key: 'submittedDate',
      label: 'Ngày Nộp',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {getStatusText(value)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (_, row) => (
        <div className="action-buttons">
          <button
            className="action-btn view-btn"
            onClick={() => handleViewDetail(row)}
          >
            Xem
          </button>
          <button
            className="action-btn download-btn"
            onClick={() => handleDownloadFile(row)}
          >
            Tải
          </button>
          {row.status !== 'sent_to_coordinator' && (
            <button
              className="action-btn send-btn"
              onClick={() => handleOpenSendModal(row)}
            >
              Gửi
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="supervisor-theses">
      <div className="page-header">
        <div>
          <h1>Quản Lý Đề Tài</h1>
          <p className="page-subtitle">Danh sách đề tài được phân công</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="md">
            📊 Xuất báo cáo
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={theses}
          emptyMessage="Chưa có đề tài nào"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi Tiết Đề Tài"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDownloadFile(selectedThesis)}
            >
              📥 Tải File
            </Button>
          </>
        }
      >
        {selectedThesis && (
          <div className="thesis-detail">
            <div className="detail-section">
              <h4>Thông Tin Sinh Viên</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Mã sinh viên:</label>
                  <span>{selectedThesis.studentCode}</span>
                </div>
                <div className="detail-item">
                  <label>Họ và tên:</label>
                  <span>{selectedThesis.studentName}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedThesis.studentEmail}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày nộp:</label>
                  <span>{selectedThesis.submittedDate}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông Tin Đề Tài</h4>
              <div className="detail-item">
                <label>Tiêu đề:</label>
                <span>{selectedThesis.title}</span>
              </div>
              <div className="detail-item">
                <label>Mô tả:</label>
                <p>{selectedThesis.description}</p>
              </div>
            </div>

            <div className="detail-section">
              <h4>File Đính Kèm</h4>
              <div className="file-info-box">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <div className="file-name">{selectedThesis.fileName}</div>
                  <div className="file-meta">
                    Kích thước: {selectedThesis.fileSize} • Tải lên: {selectedThesis.submittedDate}
                  </div>
                </div>
                <button
                  className="download-file-btn"
                  onClick={() => handleDownloadFile(selectedThesis)}
                >
                  Tải xuống
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h4>Trạng Thái</h4>
              <Badge variant={getStatusVariant(selectedThesis.status)} size="lg">
                {getStatusText(selectedThesis.status)}
              </Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* Send to Coordinator Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Gửi Đề Tài Cho Người Điều Phối"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSendToCoordinator}>
              Gửi Đề Tài
            </Button>
          </>
        }
      >
        {selectedThesis && (
          <div className="send-form">
            <div className="form-group">
              <label>Đề tài:</label>
              <p className="thesis-info-text">{selectedThesis.title}</p>
            </div>
            <div className="form-group">
              <label>Sinh viên:</label>
              <p className="thesis-info-text">
                {selectedThesis.studentName} ({selectedThesis.studentCode})
              </p>
            </div>
            <div className="form-group">
              <label>Ghi chú cho người điều phối:</label>
              <textarea
                className="coordinator-note"
                value={coordinatorNote}
                onChange={(e) => setCoordinatorNote(e.target.value)}
                placeholder="Nhập ghi chú (không bắt buộc)..."
                rows="5"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupervisorTheses;
