import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import thesisService from '../../services/thesisService.js';
import useSemesterStore from '../../stores/semesterStore.js';
import { showSuccess, showError } from '../../utils/alert.js';
import './admin-theses.css';

const AdminTheses = () => {
  const [theses, setTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' or 'PASSED'

  // Modal detail states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedThesisDetail, setSelectedThesisDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { activeSemester, fetchActiveSemester } = useSemesterStore();

  useEffect(() => {
    const initData = async () => {
      try {
        let sem = activeSemester;
        if (!sem) {
          sem = await fetchActiveSemester();
        }
        if (sem) {
          await fetchTheses(sem.id, filterType);
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
  }, [filterType, activeSemester]);

  const fetchTheses = async (semesterId, type) => {
    setIsLoading(true);
    try {
      let data = [];
      if (type === 'PASSED') {
        data = await thesisService.getPassedTopicsBySemester(semesterId);
      } else {
        data = await thesisService.getTopicsBySemester(semesterId);
      }

      const mapped = data.map(t => {
        let studentName = 'N/A';
        try {
          if (t.studentGroupInfo) {
            const parsed = JSON.parse(t.studentGroupInfo);
            if (Array.isArray(parsed) && parsed.length > 0) {
              studentName = `${parsed[0].name} (${parsed[0].code})`;
              if (parsed.length > 1) {
                studentName += ` (+${parsed.length - 1})`;
              }
            }
          }
        } catch (error) {
          console.error('Lỗi parse JSON studentGroupInfo:', error);
        }

        return {
          ...t,
          topicCode: t.code || 'N/A',
          titleVi: t.titleVi || 'Chưa có tên tiếng Việt',
          titleEn: t.titleEn || '',
          studentName: studentName,
          supervisorName: t.supervisor?.fullName || 'Chưa phân công',
          department: t.department || 'N/A',
          submittedDate: t.submittedAt ? new Date(t.submittedAt).toLocaleDateString('vi-VN') : 'N/A',
          status: t.status || 'unknown'
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

  const handleViewDetails = async (id) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    setSelectedThesisDetail(null);
    try {
      const detail = await thesisService.getThesisById(id);
      setSelectedThesisDetail(detail);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      showError('Không thể lấy chi tiết đề tài!');
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASS':
      case 'APPROVED':
        return 'success';
      case 'FAIL':
      case 'REJECTED':
        return 'error';
      case 'IN_REVIEW':
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderStudentGroup = (infoString) => {
    try {
      if (!infoString) return 'Chưa có sinh viên';
      const parsed = JSON.parse(infoString);
      if (Array.isArray(parsed)) {
        return (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {parsed.map((sv, idx) => (
              <li key={idx}>{sv.name} - <b>{sv.code}</b></li>
            ))}
          </ul>
        );
      }
    } catch (e) {
      return infoString;
    }
    return infoString;
  };

  const columns = [
    {
      key: 'topicCode',
      label: 'Mã Đề Tài',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{val}</span>
    },
    {
      key: 'titleVi',
      label: 'TÊN ĐỀ TÀI',
      sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500 }}>{row.titleVi}</span>
          {row.titleEn && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{row.titleEn}</span>}
        </div>
      )
    },
    {
      key: 'studentName',
      label: 'SV Thực Hiện',
      sortable: true,
    },
    {
      key: 'supervisorName',
      label: 'GV Hướng Dẫn',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewDetails(row.id)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div className="admin-theses">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Quản lý đề tài</h1>
          <p className="page-subtitle">Danh sách đề tài theo kỳ hiện tại</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant={filterType === 'ALL' ? 'primary' : 'outline'} 
            size="md"
            onClick={() => setFilterType('ALL')}
          >
            Tất cả đề tài
          </Button>
          <Button 
            variant={filterType === 'PASSED' ? 'primary' : 'outline'} 
            size="md"
            onClick={() => setFilterType('PASSED')}
            style={filterType === 'PASSED' ? { background: 'var(--color-success)', borderColor: 'var(--color-success)' } : {}}
          >
            Đề tài đã đạt (PASSED)
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={theses}
          isLoading={isLoading}
          emptyMessage={filterType === 'PASSED' ? "Không có đề tài nào ĐẠT (PASSED) trong đợt này" : "Chưa có đề tài nào trong đợt này"}
        />
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết Đề Tài"
        size="lg"
        footer={<Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>}
      >
        {isLoadingDetail ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : selectedThesisDetail ? (
          <div className="thesis-detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Mã Đề Tài</p>
                <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-primary)' }}>{selectedThesisDetail.code || 'N/A'}</div>
              </div>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Trạng Thái</p>
                <Badge variant={getStatusVariant(selectedThesisDetail.status)}>{selectedThesisDetail.status}</Badge>
              </div>
            </div>

            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Tên Tiếng Việt</p>
              <div style={{ fontWeight: 500, color: '#111827' }}>{selectedThesisDetail.titleVi || 'N/A'}</div>
            </div>

            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Tên Tiếng Anh</p>
              <div style={{ color: '#111827' }}>{selectedThesisDetail.titleEn || 'N/A'}</div>
            </div>

            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Mô tả</p>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                {selectedThesisDetail.description || 'Không có mô tả'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Nhóm Sinh Viên</p>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
                  {renderStudentGroup(selectedThesisDetail.studentGroupInfo)}
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Giảng Viên</p>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
                  <div style={{ fontWeight: 500 }}>HD1: {selectedThesisDetail.supervisor?.fullName || 'Chưa có'}</div>
                  {selectedThesisDetail.supervisor2 && (
                    <div style={{ marginTop: '8px', fontWeight: 500 }}>HD2: {selectedThesisDetail.supervisor2.fullName}</div>
                  )}
                  {selectedThesisDetail.reviewer1 && <div style={{ marginTop: '8px' }}>Pbiện 1: {selectedThesisDetail.reviewer1.fullName}</div>}
                  {selectedThesisDetail.reviewer2 && <div style={{ marginTop: '4px' }}>Pbiện 2: {selectedThesisDetail.reviewer2.fullName}</div>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Khoa</p>
                <div style={{ color: '#111827', fontWeight: 500 }}>{selectedThesisDetail.department || 'N/A'}</div>
              </div>
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Học kỳ / Đợt</p>
                <div style={{ color: '#111827', fontWeight: 500 }}>
                  <Badge variant="default" style={{ marginRight: '8px' }}>{selectedThesisDetail.semester?.code || selectedThesisDetail.semester?.name || 'N/A'}</Badge>
                  {selectedThesisDetail.registrationPhase?.name || 'N/A'}
                </div>
              </div>
            </div>

            {selectedThesisDetail.finalNote && (
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '4px' }}>Ghi chú Hội Đồng / Final Note</p>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--color-warning)' }}>
                  {selectedThesisDetail.finalNote}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Không tìm thấy thông tin chi tiết</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTheses;
