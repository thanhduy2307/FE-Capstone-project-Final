import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import thesisService from '../../services/thesisService.js';
import { showError } from '../../utils/alert.js';
import { useNavigate } from 'react-router-dom';
import '../student-theses/student-theses.css';

const StudentMyThesis = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const navigate = useNavigate();
  
  const [thesisDetail, setThesisDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyThesis();
  }, []);

  const loadMyThesis = async () => {
    setIsLoading(true);
    try {
      // --- Primary strategy: use saved topicId directly ---
      const savedTopicId = localStorage.getItem('myTopicId');
      if (savedTopicId) {
        try {
          const topic = await thesisService.getThesisById(savedTopicId);
          if (topic && topic.id) {
            setThesisDetail(topic);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Could not fetch topic by saved ID, falling back...', e);
          localStorage.removeItem('myTopicId');
        }
      }

      // --- Fallback: scan semester topics to find by studentGroupInfo ---
      let activeInfo = activeSemester;
      if (!activeInfo) {
        activeInfo = await fetchActiveSemester();
      }
      
      if (activeInfo) {
        const allTheses = await thesisService.getTopicsBySemester(activeInfo.id);
        
        let userThesis = null;
        for (const t of allTheses) {
            if (t.studentGroupInfo) {
                try {
                    const parsedGroup = JSON.parse(t.studentGroupInfo);
                    const isMember = parsedGroup.some(sv => 
                      sv.code === user?.username || 
                      sv.email === user?.email || 
                      t.studentGroupInfo.includes(user?.username) || 
                      t.studentGroupInfo.includes(user?.email)
                    );
                    if (isMember) {
                        userThesis = t;
                        // Save for future fast lookups
                        localStorage.setItem('myTopicId', t.id);
                        break;
                    }
                } catch (e) {
                    if (t.studentGroupInfo.includes(user?.username) || t.studentGroupInfo.includes(user?.email)) {
                        userThesis = t;
                        localStorage.setItem('myTopicId', t.id);
                        break;
                    }
                }
            }
        }

        if (userThesis) {
            setThesisDetail(userThesis);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin đề tài:', error);
      showError('Không thể tải thông tin đề tài của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    // Navigate back to the theses page but with state indicating edit mode
    navigate('/student/theses', { state: { thesisDetail, mode: 'edit' } });
  };

  const handleResubmitClick = () => {
    // Navigate back to the theses page but with state indicating resubmit mode
    navigate('/student/theses', { state: { thesisDetail, mode: 'resubmit' } });
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

  if (!thesisDetail) {
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

      <Card>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Chi tiết Đề tài: {thesisDetail.titleVi || 'Chưa có tên'}</h3>
            {thesisDetail.status === 'PENDING' && (
              <Button size="sm" variant="outline" onClick={handleEditClick}>Sửa Đề tài</Button>
            )}
          </div>
          <hr style={{borderColor: 'var(--border-color)', margin: '15px 0'}} />
          <div style={{display: 'flex', gap: '40px', lineHeight: '2'}}>
            <div>
              <p><strong>Mã Đề tài:</strong> {thesisDetail.code || thesisDetail.id || '---'}</p>
              <p><strong>Ngành:</strong> {thesisDetail.department || '---'}</p>
              <p><strong>Số lượng TV:</strong> {thesisDetail.studentCount || 1}</p>
            </div>
            <div>
              <p><strong>Trình trạng nộp:</strong> Đã gửi biên bản đề xuất</p>
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
                  Đề tài của bạn đã bị từ chối. Vui lòng xem lại nhận xét và tiến hành nộp lại.
                </p>
                {thesisDetail.finalNote && (
                  <p style={{ fontStyle: 'italic', marginBottom: '15px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
                    Ghi chú: {thesisDetail.finalNote}
                  </p>
                )}
                <Button variant="danger" onClick={handleResubmitClick}>Nộp Lại Đề Tài</Button>
              </div>
            ) : thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS' ? (
              <p>Đề tài của bạn đã được phê duyệt thành công! Bạn có thể xem chi tiết và nộp bản hoàn chỉnh bên dưới.</p>
            ) : (
              <p>
                Đề tài của bạn đã được hệ thống ghi nhận.
                Đang trong quá trình chờ phê duyệt bởi Hội đồng chuyên môn (Moderator).
              </p>
            )}
          </div>

          <div style={{marginTop: '30px'}}>
            <h4>Nộp bản hoàn chỉnh</h4>
            <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px'}}>
              Vui lòng nộp báo cáo hoàn thiện theo yêu cầu của Giảng viên HD (áp dụng sau khi được duyệt).
            </p>
            <input type="file" style={{ color: 'var(--text-primary)', marginTop: '8px'}} disabled={!(thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS')} />
            <Button size="sm" variant="primary" style={{marginTop: '15px', display: 'block'}} disabled={!(thesisDetail.status === 'APPROVED' || thesisDetail.status === 'PASS')}>Upload Báo Cáo</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentMyThesis;
