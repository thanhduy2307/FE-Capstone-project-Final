import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import thesisService from '../../services/thesisService.js';
import useSemesterStore from '../../stores/semesterStore.js';
import { showSuccess, showError } from '../../utils/alert.js';
import './admin-theses.css';

const AdminTheses = () => {
  const [theses, setTheses] = useState([]);
  const [selectedTheses, setSelectedTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [currentThesis, setCurrentThesis] = useState(null);

  const { activeSemester, fetchActiveSemester } = useSemesterStore();

  useEffect(() => {
    const initData = async () => {
      try {
        let sem = activeSemester;
        if (!sem) {
          sem = await fetchActiveSemester();
        }
        if (sem) {
          await fetchTheses(sem.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Lỗi khởi tạo:', error);
        setIsLoading(false);
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTheses = async (semesterId) => {
    setIsLoading(true);
    try {
      const data = await thesisService.getTopicsBySemester(semesterId);
      // Map API data to table columns
      const mapped = data.map(t => {
          let studentName = 'N/A';
          try {
             if (t.studentGroupInfo) {
                 const parsed = JSON.parse(t.studentGroupInfo);
                 if (Array.isArray(parsed) && parsed.length > 0) {
                     studentName = parsed[0].name + (parsed.length > 1 ? ` (+${parsed.length - 1})` : '');
                 }
             }
          } catch (error) {
            console.error('Lỗi parse JSON studentGroupInfo:', error);
          }

          return {
             ...t,
             title: t.titleVi || t.titleEn || t.title || 'Chưa có tên',
             studentName: studentName,
             supervisorName: t.supervisor?.fullName || t.supervisor?.name || 'Chưa phân công',
             supervisorEmail: t.supervisor?.email || '',
             submittedDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : 'N/A',
             status: t.status ? t.status.toLowerCase() : 'pending' 
          };
      });
      setTheses(mapped);
    } catch (error) {
      console.error('Failed to fetch theses:', error);
      showError('Không thể tải danh sách đề tài!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await thesisService.updateThesis(id, { status: 'APPROVED' });
      showSuccess('Đã phê duyệt đề tài thành công!');
      if (activeSemester) fetchTheses(activeSemester.id);
    } catch (error) {
      console.error('Failed to approve thesis:', error);
      showError('Phê duyệt đề tài thất bại!');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Lý do từ chối:');
    if (reason !== null) {
      try {
        await thesisService.updateThesis(id, { status: 'REJECTED', rejectReason: reason });
        showSuccess('Đã từ chối đề tài!');
        if (activeSemester) fetchTheses(activeSemester.id);
      } catch (error) {
        console.error('Failed to reject thesis:', error);
        showError('Từ chối đề tài thất bại!');
      }
    }
  };

  const handleSendEmail = (thesis) => {
    setCurrentThesis(thesis);
    setEmailData({
      subject: `Thông báo về đề tài: ${thesis.title}`,
      message: '',
    });
    setIsEmailModalOpen(true);
  };

  // NEW: Send email to all supervisors
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkEmailData, setBulkEmailData] = useState({ subject: '', message: '' });

  const handleSendBulkEmail = () => {
    setBulkEmailData({
      subject: 'Thông báo từ Ban Quản Lý Đề Tài',
      message: '',
    });
    setIsBulkEmailModalOpen(true);
  };

  const handleBulkEmailSubmit = async () => {
    try {
      // Get unique supervisors
      const uniqueSupervisors = [...new Map(
        theses.map(thesis => [thesis.supervisorEmail, thesis])
      ).values()];

      // Send email to all supervisors
      const promises = uniqueSupervisors.map(thesis =>
        thesisService.sendEmailToSupervisor(thesis.id, bulkEmailData)
      );

      await Promise.all(promises);
      
      setIsBulkEmailModalOpen(false);
      setBulkEmailData({ subject: '', message: '' });
      showSuccess(`Email đã được gửi thành công đến ${uniqueSupervisors.length} giảng viên!`);
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      showError('Gửi email hàng loạt thất bại!');
    }
  };

  const handleEmailSubmit = async () => {
    if (!currentThesis) return;
    
    try {
      await thesisService.sendEmailToSupervisor(currentThesis.id, emailData);
      setIsEmailModalOpen(false);
      setEmailData({ subject: '', message: '' });
      showSuccess('Email đã được gửi thành công!');
    } catch (error) {
      console.error('Failed to send email:', error);
      showError('Gửi email thất bại!');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Thesis Title',
      sortable: true,
    },
    {
      key: 'studentName',
      label: 'Student',
      sortable: true,
    },
    {
      key: 'supervisorName',
      label: 'Supervisor',
      sortable: true,
    },
    {
      key: 'submittedDate',
      label: 'Submitted Date',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          {row.status === 'pending' && (
            <>
              <button
                className="action-btn approve-btn"
                onClick={() => handleApprove(row.id)}
              >
                Approve
              </button>
              <button
                className="action-btn reject-btn"
                onClick={() => handleReject(row.id)}
              >
                Reject
              </button>
            </>
          )}
          <button
            className="action-btn email-btn"
            onClick={() => handleSendEmail(row)}
          >
            Email
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-theses">
      <div className="page-header">
        <div>
          <h1>Thesis Management</h1>
          <p className="page-subtitle">Quản lý đề tài tốt nghiệp</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="md">
            Export
          </Button>
          <Button variant="outline" size="md">
            Filter
          </Button>
          <Button variant="primary" size="md" onClick={handleSendBulkEmail}>
            📧 Gửi Email cho Tất Cả GV
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={theses}
          isLoading={isLoading}
          selectable={true}
          selectedRows={selectedTheses}
          onSelectionChange={setSelectedTheses}
          emptyMessage="Không có đề tài nào"
        />
      </Card>

      {/* Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Gửi Email cho Giảng Viên Hướng Dẫn"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleEmailSubmit}>
              Gửi Email
            </Button>
          </>
        }
      >
        <div className="email-form">
          <div className="form-group">
            <label>Người nhận:</label>
            <p className="recipient-info">
              {currentThesis?.supervisorName} ({currentThesis?.supervisorEmail})
            </p>
          </div>
          <div className="form-group">
            <label>Tiêu đề:</label>
            <Input
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Nhập tiêu đề email"
            />
          </div>
          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              className="email-textarea"
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Nhập nội dung email"
              rows="6"
            />
          </div>
        </div>
      </Modal>

      {/* Bulk Email Modal */}
      <Modal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        title="Gửi Email cho Tất Cả Giảng Viên Hướng Dẫn"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBulkEmailModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleBulkEmailSubmit}>
              Gửi Email cho Tất Cả
            </Button>
          </>
        }
      >
        <div className="email-form">
          <div className="form-group">
            <label>Người nhận:</label>
            <p className="recipient-info">
              Tất cả giảng viên hướng dẫn ({[...new Set(theses.map(t => t.supervisorEmail))].length} người)
            </p>
            <div className="supervisor-list">
              {[...new Map(theses.map(t => [t.supervisorEmail, t])).values()].map((thesis, index) => (
                <div key={index} className="supervisor-item">
                  • {thesis.supervisorName} ({thesis.supervisorEmail})
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Tiêu đề:</label>
            <Input
              value={bulkEmailData.subject}
              onChange={(e) => setBulkEmailData({ ...bulkEmailData, subject: e.target.value })}
              placeholder="Nhập tiêu đề email"
            />
          </div>
          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              className="email-textarea"
              value={bulkEmailData.message}
              onChange={(e) => setBulkEmailData({ ...bulkEmailData, message: e.target.value })}
              placeholder="Nhập nội dung email"
              rows="6"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTheses;
