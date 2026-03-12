import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import usePeriodStore from '../../stores/periodStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import './admin-periods.css';

const AdminPeriods = () => {
  const { periods, isLoading, fetchPeriods, createPeriod, updatePeriod, deletePeriod, openPeriod, closePeriod } = usePeriodStore();
  const { semesters, activeSemester, fetchSemesters, fetchActiveSemester, createSemester, activateSemester } = useSemesterStore();
  
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateSemesterModalOpen, setIsCreateSemesterModalOpen] = useState(false);
  
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      // Mock data for now
      setTimeout(() => {
        // This would be replaced with actual fetchPeriods() call
      }, 500);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    }
  };

  // Mock data
  const mockPeriods = [
    {
      id: 1,
      name: 'Học kỳ 1 - 2023/2024',
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      status: 'closed',
      totalTheses: 45,
    },
    {
      id: 2,
      name: 'Học kỳ 2 - 2023/2024',
      startDate: '2024-01-01',
      endDate: '2024-05-31',
      status: 'open',
      totalTheses: 32,
    },
    {
      id: 3,
      name: 'Học kỳ 1 - 2024/2025',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      status: 'upcoming',
      totalTheses: 0,
    },
  ];

  const handleCreate = () => {
    setFormData({ name: '', startDate: '', endDate: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (period) => {
    setCurrentPeriod(period);
    setFormData({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      description: period.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đợt nộp này?')) {
      try {
        await deletePeriod(id);
        loadPeriods();
      } catch (error) {
        console.error('Failed to delete period:', error);
      }
    }
  };

  const handleOpen = async (id) => {
    try {
      await openPeriod(id);
      loadPeriods();
    } catch (error) {
      console.error('Failed to open period:', error);
    }
  };

  const handleClose = async (id) => {
    try {
      await closePeriod(id);
      loadPeriods();
    } catch (error) {
      console.error('Failed to close period:', error);
    }
  };

  const handleSubmitCreate = async () => {
    try {
      await createPeriod(formData);
      setIsCreateModalOpen(false);
      loadPeriods();
    } catch (error) {
      console.error('Failed to create period:', error);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentPeriod) return;
    
    try {
      await updatePeriod(currentPeriod.id, formData);
      setIsEditModalOpen(false);
      loadPeriods();
    } catch (error) {
      console.error('Failed to update period:', error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'error';
      case 'upcoming':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Period Name',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
    },
    {
      key: 'totalTheses',
      label: 'Total Theses',
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
          <button
            className="action-btn edit-btn"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          {row.status === 'closed' && (
            <button
              className="action-btn open-btn"
              onClick={() => handleOpen(row.id)}
            >
              Open
            </button>
          )}
          {row.status === 'open' && (
            <button
              className="action-btn close-btn"
              onClick={() => handleClose(row.id)}
            >
              Close
            </button>
          )}
          <button
            className="action-btn delete-btn"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const PeriodForm = () => (
    <div className="period-form">
      <div className="form-group">
        <label>Tên đợt nộp:</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="VD: Học kỳ 1 - 2024/2025"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Ngày bắt đầu:</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Ngày kết thúc:</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Mô tả:</label>
        <textarea
          className="form-textarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Nhập mô tả cho đợt nộp"
          rows="4"
        />
      </div>
    </div>
  );

  return (
    <div className="admin-periods">
      <div className="page-header">
        <div>
          <h1>Period Management</h1>
          <p className="page-subtitle">Quản lý đợt nộp đề tài</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" size="md" onClick={handleCreate}>
            + Tạo đợt nộp mới
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={mockPeriods}
          isLoading={isLoading}
          selectable={true}
          selectedRows={selectedPeriods}
          onSelectionChange={setSelectedPeriods}
          emptyMessage="Chưa có đợt nộp nào"
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo đợt nộp mới"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitCreate}>
              Tạo
            </Button>
          </>
        }
      >
        <PeriodForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa đợt nộp"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitEdit}>
              Lưu
            </Button>
          </>
        }
      >
        <PeriodForm />
      </Modal>
    </div>
  );
};

export default AdminPeriods;
