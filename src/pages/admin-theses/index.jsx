import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import thesisService from '../../services/thesisService.js';
import useSemesterStore from '../../stores/semesterStore.js';
import { showSuccess, showError } from '../../utils/alert.js';
import './admin-theses.css';

const AdminTheses = () => {
  const [theses, setTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' or 'PASSED'

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
  }, [filterType, activeSemester]); // Refetch when filter or semester changes

  const fetchTheses = async (semesterId, type) => {
    setIsLoading(true);
    try {
      let data = [];
      if (type === 'PASSED') {
        data = await thesisService.getPassedTopicsBySemester(semesterId);
      } else {
        data = await thesisService.getTopicsBySemester(semesterId);
      }

      // Map API data to table columns based on topics.md response
      const mapped = data.map(t => {
        let studentName = 'N/A';
        try {
          if (t.studentGroupInfo) {
            const parsed = JSON.parse(t.studentGroupInfo);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Combine name and student code (e.g., "Nguyen Văn A (SE123)")
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

  const getStatusVariant = (status) => {
    switch (status.toUpperCase()) {
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
      key: 'department',
      label: 'Khoa',
      sortable: true,
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
          {value.replace('_', ' ')}
        </Badge>
      ),
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
    </div>
  );
};

export default AdminTheses;
