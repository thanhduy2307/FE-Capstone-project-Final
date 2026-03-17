import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import './student-dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods, isLoading: isLoadingPeriodsStore } = usePeriodStore();
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  useEffect(() => {
    loadSemesterData();
  }, []);

  const loadSemesterData = async () => {
    setIsLoadingPeriods(true);
    const activeInfo = await fetchActiveSemester();
    if (activeInfo) {
      await fetchOpenPeriods(activeInfo.id);
    }
    setIsLoadingPeriods(false);
  };

  const myThesis = null; // Currently no real thesis data is fetched from API, keep it null to show registration prompt.

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Xin chào, Sinh viên {user?.name || user?.fullName}! 👋</h1>
        <p className="dashboard-subtitle">Theo dõi tiến độ Đề tài tốt nghiệp của bạn</p>
      </div>

      <Card className="semester-info-card" style={{ marginBottom: '20px' }}>
        <h3>Thông tin Học kỳ</h3>
        {activeSemester ? (
          <div>
            <p><strong>Học kỳ hiện tại:</strong> {activeSemester.name} ({activeSemester.code})</p>
            {isLoadingPeriods ? (
              <p>Đang tải thông tin đợt nộp...</p>
            ) : openPeriods && openPeriods.length > 0 ? (
              <div style={{ marginTop: '15px' }}>
                <p><strong>Các đợt nộp đang mở:</strong></p>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  {openPeriods.map(period => (
                    <li key={period.id} style={{ marginBottom: '5px' }}>
                      <strong>{period.name}</strong> <Badge variant="success">OPEN</Badge><br/>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        (Từ {new Date(period.startDate).toLocaleDateString('vi-VN')} đến {new Date(period.endDate).toLocaleDateString('vi-VN')})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
                <p style={{ marginTop: '10px', color: '#888' }}>
                  Hiện tại không có đợt đăng ký đề tài nào đang mở.
                </p>
            )}
          </div>
        ) : (
          <p>Chưa có thông tin học kỳ hiện tại.</p>
        )}
      </Card>

      <Card className="student-status-card">
        <h3>Trạng thái Đề tài hiện tại</h3>
        {myThesis ? (
          <div className="status-content">
            <p><strong>Tên đề tài:</strong> {myThesis.title}</p>
            <p><strong>Mã ngành:</strong> {myThesis.department}</p>
            <p><strong>Nhóm:</strong> {myThesis.teamSize} thành viên</p>
            <p><strong>Giảng viên Hướng dẫn:</strong> {myThesis.supervisorName}</p>
            <p><strong>Ngày nộp:</strong> {myThesis.submittedDate}</p>
            <p style={{ marginTop: '10px' }}>
              <strong>Trạng thái: </strong> 
              <Badge variant="warning">Đang chờ xét duyệt (PENDING)</Badge>
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/student/theses">
                <Button variant="primary">Xem chi tiết Đề tài</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="status-content">
            <p style={{ color: '#888' }}>Bạn chưa có Đề tài nào được đăng ký thành công trên hệ thống.</p>
            <div style={{ marginTop: '15px' }}>
              <Link to="/student/theses">
                <Button variant="primary" disabled={!openPeriods || openPeriods.length === 0}>
                  {openPeriods && openPeriods.length > 0 ? 'Đăng ký Đề tài Mới' : 'Chưa đến đợt đăng ký'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
