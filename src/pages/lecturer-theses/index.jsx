import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Table from '../../components/Table.jsx';
import useLecturerStore from '../../stores/lecturerStore.js';
import './lecturer-theses.css';

const LecturerTheses = () => {
  const { supervisedTheses, fetchSupervisedTheses } = useLecturerStore();
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // fetchSupervisedTheses();
  }, []);

  // Mock data
  const theses = [
    {
      id: 1,
      code: 'DT2024001',
      title: 'Phát triển ứng dụng AI cho giao thông',
      department: 'AI',
      supervisorName: 'PGS.TS Nguyễn Văn A',
      status: 'pending_review',
      description: 'Nghiên cứu ứng dụng các thuật toán Machine Learning trong việc phân tích...',
      reviewer1: { name: 'HuongNTC2', result: 'Consider', score: 0 },
      reviewer2: { name: 'PhuongLHK', result: 'Not Pass', score: -1 },
      reviewer3: null,
      conflict: false,
      score12: -1,
      finalScore: -1,
      finalResult: 'Not Pass'
    },
    {
      id: 2,
      code: 'DT2024002',
      title: 'Xây dựng hệ thống quản lý bằng Blockchain',
      department: 'SE',
      supervisorName: 'TS Lê C',
      status: 'approved',
      description: 'Xây dựng hệ thống quản lý sử dụng công nghệ Blockchain đảm bảo minh bạch...',
      reviewer1: { name: 'KhanhKT', result: 'Pass', score: 1 },
      reviewer2: { name: 'TaiNT51', result: 'Not Pass', score: -1 },
      reviewer3: { name: 'PhuongLHK', result: 'Not Pass', score: -1 },
      conflict: true,
      score12: 0,
      finalScore: -1,
      finalResult: 'Not Pass'
    },
    {
      id: 3,
      code: 'DT2024003',
      title: 'Hệ thống đánh giá tự động đa ngôn ngữ',
      department: 'SE',
      supervisorName: 'TS Lê D',
      status: 'approved',
      description: 'Hệ thống sử dụng LLM để chấm bài luận tự động...',
      reviewer1: { name: 'HuongNTC2', result: 'Consider', score: 0 },
      reviewer2: { name: 'TaiNT51', result: 'Pass', score: 1 },
      reviewer3: null,
      conflict: false,
      score12: 1,
      finalScore: 1,
      finalResult: 'Pass'
    }
  ];

  const handleViewDetail = (thesis) => {
    setSelectedThesis(thesis);
    setIsDetailModalOpen(true);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'sent_to_coordinator':
        return 'success';
      case 'approved':
        return 'success';
      case 'rejected':
      case 'conflict':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ hướng dẫn';
      case 'sent_to_coordinator':
        return 'Đã trình lên';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
      case 'conflict':
        return 'Có vấn đề';
      default:
        return status;
    }
  };

  const columns = [
    { key: 'code', label: 'Mã Đề Tài', sortable: true },
    { key: 'title', label: 'Tên Đề Tài', sortable: true },
    { key: 'department', label: 'Chuyên Ngành', sortable: true },
    {
      key: 'finalResult',
      label: 'Kết Quả',
      render: (value) => {
        if (!value) return <span style={{color: '#888'}}>Chưa có kết quả</span>;
        return (
          <Badge variant={value === 'Pass' ? 'success' : value === 'Consider' ? 'warning' : 'error'}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view-btn" onClick={() => handleViewDetail(row)}>
            Chi tiết
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="lecturer-theses">
      <div className="page-header">
        <div>
          <h1>Đề Tài Đăng Ký (Registration)</h1>
          <p className="page-subtitle">Tổng quan danh sách tất cả các đề tài đã nộp và thông tin đăng ký</p>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={theses} emptyMessage="Chưa có đề tài nào" />
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Tiến Độ Hội Đồng"
        size="lg"
      >
        {selectedThesis && (
          <div className="thesis-detail">
            <h4>{selectedThesis.title}</h4>
            <div className="supervisor-info mt-2 mb-4">
              <strong>Giảng viên HD:</strong> {selectedThesis.supervisorName}
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="review-results-table">
                <thead>
                  <tr>
                    <th>Reviewer 1</th>
                    <th>Reviewer 2</th>
                    <th>Reviewer 3 (Opt)</th>
                    <th>Conflict</th>
                    <th>Result 1</th>
                    <th>Result 2</th>
                    <th>Score12</th>
                    <th>Result3-Opt</th>
                    <th>Final Score</th>
                    <th>Final Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedThesis.reviewer1?.name}</td>
                    <td>{selectedThesis.reviewer2?.name}</td>
                    <td>{selectedThesis.reviewer3?.name || ''}</td>
                    <td>{selectedThesis.conflict ? 'TRUE' : 'FALSE'}</td>
                    <td>{selectedThesis.reviewer1?.result || ''}</td>
                    <td>{selectedThesis.reviewer2?.result || ''}</td>
                    <td>{selectedThesis.score12}</td>
                    <td>{selectedThesis.reviewer3?.result || ''}</td>
                    <td>{selectedThesis.finalScore}</td>
                    <td>
                      {selectedThesis.finalResult ? (
                        <Badge variant={selectedThesis.finalResult === 'Pass' ? 'success' : 'error'}>
                          {selectedThesis.finalResult}
                        </Badge>
                      ) : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default LecturerTheses;
