import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import thesisService from '../../services/thesisService.js';
import { showError } from '../../utils/alert.js';
import { useNavigate } from 'react-router-dom';
import '../student-theses/student-theses.css';

const StudentMyThesis = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods } = usePeriodStore();
  const navigate = useNavigate();
  
  const [theses, setTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyTheses();
    loadSemesterData();
  }, []);

  const loadSemesterData = async () => {
    const activeInfo = await fetchActiveSemester();
    if (activeInfo) {
      await fetchOpenPeriods(activeInfo.id);
    }
  };

  const loadMyTheses = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;

      const topics = await thesisService.getTopicsBySubmitter(user.id);
      
      if (topics && Array.isArray(topics)) {
        setTheses(topics);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin đề tài:', error);
      showError('Không thể tải thông tin đề tài của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (thesisDetail) => {
    // Navigate back to the theses page but with state indicating edit mode
    navigate('/student/theses', { state: { thesisDetail, mode: 'edit' } });
  };

  if (isLoading) {
    return (
      <div className="student-theses">
        <div className="page-header">
          <h1>Đề Tài Của Tôi</h1>
          <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
        </div>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        </Card>
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="student-theses">
        <div className="page-header">
          <h1>Đề Tài Của Tôi</h1>
          <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
        </div>
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Bạn chưa có Đề Tài nào!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Bạn chưa nộp đề tài nào hoặc hệ thống chưa ghi nhận. Vui lòng chuyển sang trang <strong>Đăng ký Đề Tài</strong> để tiến hành nộp biểu mẫu.
            </p>
            <Button variant="primary" onClick={() => navigate('/student/theses')}>Đến trang Đăng ký Đề Tài</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="student-theses">
      <div className="page-header">
        <h1>Đề Tài Của Tôi</h1>
        <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {theses.map((thesisDetail) => (
          <Card key={thesisDetail.id || thesisDetail.code}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Chi tiết Đề tài: {thesisDetail.titleVi || 'Chưa có tên'}</h3>
                {thesisDetail.status === 'PENDING' && (
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(thesisDetail)}>Sửa Đề tài</Button>
                )}
              </div>
              <hr style={{borderColor: 'var(--border-color)', margin: '15px 0'}} />
              <div style={{display: 'flex', gap: '40px', lineHeight: '2', flexWrap: 'wrap'}}>
                <div>
                  <p><strong>Mã Đề tài:</strong> {thesisDetail.code || thesisDetail.id || '---'}</p>
                  <p><strong>Ngành:</strong> {thesisDetail.department || '---'}</p>
                  <p><strong>Số lượng TV:</strong> {thesisDetail.studentCount || 1}</p>
                </div>
                <div>
                  <p><strong>Kì nộp:</strong> <Badge variant="default">{thesisDetail.semester?.code || thesisDetail.semester?.name || '---'}</Badge></p>
                  <p><strong>Đợt nộp:</strong> {thesisDetail.registrationPhase?.name || '---'}</p>
                  <p>
                    <strong>Trạng thái phê duyệt:</strong>{' '}
                    {thesisDetail.status === 'REJECTED' ? (
                      <Badge variant="error">Bị từ chối</Badge>
                    ) : thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS' ? (
                      <Badge variant="success">Đã duyệt</Badge>
                    ) : (
                      <Badge variant="warning">Đang xử lý</Badge>
                    )}
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '30px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>Kết quả Đăng ký Đề tài</h4>
                {thesisDetail.status === 'REJECTED' ? (
                  <div>
                    <p style={{ color: 'var(--text-danger)', marginBottom: '15px' }}>
                      Đề tài của bạn đã bị từ chối. Bạn không thể nộp lại đề tài trong cùng đợt đăng ký này.
                    </p>
                    {thesisDetail.finalNote && (
                      <p style={{ fontStyle: 'italic', marginBottom: '15px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
                        Ghi chú: {thesisDetail.finalNote}
                      </p>
                    )}
                  </div>
                ) : thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS' ? (
                  <p>Đề tài của bạn đã được phê duyệt thành công!</p>
                ) : (
                  <p>
                    Đề tài của bạn đã được hệ thống ghi nhận.
                    Đang trong quá trình chờ phê duyệt bởi Hội đồng chuyên môn (Moderator).
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentMyThesis;
