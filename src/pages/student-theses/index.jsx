import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Input from '../../components/Input.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import thesisService from '../../services/thesisService.js';
import { showSuccess, showError, showWarning } from '../../utils/alert.js';
import './student-theses.css';

const StudentTheses = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods } = usePeriodStore();
  
  // Dummy data. In a real app we fetch this from API.
  const [hasThesis, setHasThesis] = useState(false);
  const [thesisDetail, setThesisDetail] = useState(null);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  // views: 'periods' | 'register' | 'status'
  const [currentView, setCurrentView] = useState('periods');
  const [formMode, setFormMode] = useState('register'); // 'register' | 'edit' | 'resubmit'

  // Form state
  const [formData, setFormData] = useState({
    registrationPhaseId: '',
    titleEn: '',
    titleVi: '',
    description: '',
    department: '',
    studentCount: 1,
    studentGroupInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSemesterData();
    if (hasThesis) {
      setCurrentView('status');
    } else {
      setCurrentView('periods');
    }
  }, [hasThesis]);

  const loadSemesterData = async () => {
    setIsLoadingPeriods(true);
    const activeInfo = await fetchActiveSemester();
    if (activeInfo) {
      await fetchOpenPeriods(activeInfo.id);
    }
    setIsLoadingPeriods(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!activeSemester) {
      showWarning('Không tìm thấy Học kỳ hiện tại.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Construct payload according to API spec
      const payload = {
        semesterId: activeSemester.id,
        registrationPhaseId: parseInt(formData.registrationPhaseId),
        titleEn: formData.titleEn,
        titleVi: formData.titleVi,
        description: formData.description,
        department: formData.department,
        // Assuming studentGroupInfo is typed as JSON string matching the required format
        studentGroupInfo: formData.studentGroupInfo,
        studentCount: parseInt(formData.studentCount)
      };

      if (formMode === 'edit' && thesisDetail) {
        await thesisService.updateThesis(thesisDetail.id, payload);
        showSuccess('Cập nhật đề tài thành công!');
      } else if (formMode === 'resubmit' && thesisDetail) {
        await thesisService.resubmitStudentThesis(thesisDetail.id, payload);
        showSuccess('Nộp lại đề tài thành công!');
      } else {
        await thesisService.createStudentThesis(payload);
        showSuccess('Nộp đề tài thành công! Vui lòng chờ phản hồi.');
      }
      
      setThesisDetail({
        id: thesisDetail?.id || 'T999',
        ...formData,
        status: formMode === 'resubmit' ? 'PENDING' : (thesisDetail?.status || 'PENDING')
      });
      setHasThesis(true);
      setCurrentView('status');
    } catch (error) {
      console.error('Failed to submit thesis:', error);
      showError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi nộp đề tài.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (thesisDetail) {
      setFormData({
        registrationPhaseId: thesisDetail.registrationPhaseId || '',
        titleEn: thesisDetail.titleEn || '',
        titleVi: thesisDetail.titleVi || '',
        description: thesisDetail.description || '',
        department: thesisDetail.department || '',
        studentCount: thesisDetail.studentCount || 1,
        studentGroupInfo: thesisDetail.studentGroupInfo || '',
      });
    }
    setFormMode('edit');
    setCurrentView('register');
  };

  const handleResubmitClick = () => {
    if (thesisDetail) {
      setFormData({
        registrationPhaseId: thesisDetail.registrationPhaseId || '',
        titleEn: thesisDetail.titleEn || '',
        titleVi: thesisDetail.titleVi || '',
        description: thesisDetail.description || '',
        department: thesisDetail.department || '',
        studentCount: thesisDetail.studentCount || 1,
        studentGroupInfo: thesisDetail.studentGroupInfo || '',
      });
    }
    setFormMode('resubmit');
    setCurrentView('register');
  };

  const handleCancelForm = () => {
    if (formMode === 'edit' || formMode === 'resubmit') {
      setCurrentView('status');
    } else {
      setCurrentView('periods');
    }
  };

  const renderPeriodsView = () => (
    <div>
      <h3 style={{marginBottom: '20px'}}>Thông tin Đợt Đăng ký Đề tài</h3>
      {isLoadingPeriods ? (
        <p>Đang tải thông tin đợt đăng ký...</p>
      ) : openPeriods && openPeriods.length > 0 ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '10px' }}>Các đợt đang mở trong học kỳ này:</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              {openPeriods.map(p => (
                <li key={p.id}>
                  <strong>{p.name}</strong> 
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                    (Hạn nộp: {new Date(p.endDate).toLocaleDateString('vi-VN')})
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="primary" onClick={() => setCurrentView('register')}>
            Tiến hành Đăng ký Đề tài Mới
          </Button>
        </div>
      ) : (
        <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Hiện tại không có đợt đăng ký đề tài nào đang mở trong học kỳ này.</p>
        </div>
      )}
    </div>
  );

  const renderRegisterView = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <Button variant="secondary" onClick={handleCancelForm}>Trở lại</Button>
        <h3 style={{ margin: 0 }}>
          {formMode === 'edit' ? 'Cập nhật Đề Tài' : formMode === 'resubmit' ? 'Nộp Lại Đề Tài' : 'Đăng ký Đề Tài Mới'}
        </h3>
      </div>
      <form onSubmit={handleRegisterSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label><strong>Chọn Đợt Đăng Ký:</strong></label>
          <select 
            name="registrationPhaseId"
            value={formData.registrationPhaseId}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', marginTop: '8px' }} required>
            <option value="">-- Chọn đợt nộp --</option>
            {openPeriods.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Hạn: {new Date(p.endDate).toLocaleDateString('vi-VN')})</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label>Tên đề tài (Tiếng Việt):</label>
            <Input name="titleVi" value={formData.titleVi} onChange={handleInputChange} placeholder="Nhập tên đề tài tiếng Việt..." required />
          </div>
          <div>
            <label>Tên đề tài (Tiếng Anh):</label>
            <Input name="titleEn" value={formData.titleEn} onChange={handleInputChange} placeholder="Nhập tên đề tài tiếng Anh..." required />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '15px' }}>
          <label>Miêu tả đề tài:</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả ngắn gọn về đề tài..." 
            rows={4} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', marginTop: '8px', resize: 'vertical' }}
            required 
          />
        </div>
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <label>Mã ngành:</label>
            <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="VD: SE, IA, AI..." required />
          </div>
          <div>
            <label>Số lượng thành viên:</label>
            <Input type="number" min="1" max="5" name="studentCount" value={formData.studentCount} onChange={handleInputChange} placeholder="Ví dụ: 3" required />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '15px' }}>
          <label>Thông tin nhóm (JSON theo mẫu): <br/>
            <small style={{color: 'var(--text-secondary)'}}>Ví dụ: <code>[&#123;"name":"Nguyễn Văn A","code":"SE1"&#125;]</code></small>
          </label>
          <Input name="studentGroupInfo" value={formData.studentGroupInfo} onChange={handleInputChange} placeholder='[{"name":"Nguyễn Văn A","code":"SE1"}]' required />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : (formMode === 'edit' ? 'Cập nhật' : formMode === 'resubmit' ? 'Nộp Lại' : 'Nộp Đề Tài')}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancelForm} disabled={isSubmitting}>Hủy</Button>
        </div>
      </form>
    </div>
  );

  const renderStatusView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Chi tiết Đề tài: {thesisDetail?.titleVi || 'Chưa có tên'}</h3>
        {thesisDetail?.status === 'PENDING' && (
          <Button size="sm" variant="outline" onClick={handleEditClick}>Sửa Đề tài</Button>
        )}
      </div>
      <hr style={{borderColor: 'var(--border-color)', margin: '15px 0'}} />
      <div style={{display: 'flex', gap: '40px', lineHeight: '2'}}>
        <div>
          <p><strong>Mã Đề tài:</strong> {thesisDetail?.id || '---'}</p>
          <p><strong>Ngành:</strong> {thesisDetail?.department || '---'}</p>
          <p><strong>Số lượng TV:</strong> {thesisDetail?.studentCount || 1}</p>
        </div>
        <div>
          <p><strong>Trình trạng nộp:</strong> Đã gửi biên bản đề xuất</p>
          <p>
            <strong>Đánh giá AI:</strong> <Badge variant="success">95/100 Điểm (PASS)</Badge>
          </p>
          <p>
            <strong>Trạng thái phê duyệt:</strong>{' '}
            {thesisDetail?.status === 'REJECTED' ? (
              <Badge variant="danger">REJECTED (Bị từ chối)</Badge>
            ) : thesisDetail?.status === 'APPROVED' ? (
              <Badge variant="success">APPROVED (Đã duyệt)</Badge>
            ) : (
              <Badge variant="warning">PENDING (Chờ duyệt)</Badge>
            )}
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '10px' }}>Kết quả Đăng ký Đề tài</h4>
        {thesisDetail?.status === 'REJECTED' ? (
          <div>
            <p style={{ color: 'var(--text-danger)', marginBottom: '15px' }}>
              Đề tài của bạn đã bị từ chối. Vui lòng xem lại nhận xét và tiến hành nộp lại.
            </p>
            <Button variant="danger" onClick={handleResubmitClick}>Nộp Lại Đề Tài</Button>
          </div>
        ) : thesisDetail?.status === 'APPROVED' ? (
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
        <input type="file" style={{ color: 'var(--text-primary)', marginTop: '8px'}} disabled={thesisDetail?.status !== 'APPROVED'} />
        <Button size="sm" variant="primary" style={{marginTop: '15px', display: 'block'}} disabled={thesisDetail?.status !== 'APPROVED'}>Upload Báo Cáo</Button>
      </div>
    </div>
  );

  return (
    <div className="student-theses">
      <div className="page-header">
        {currentView === 'register' ? (
          <>
            <h1>Đăng Ký Đề Tài Mới</h1>
            <p>Điền thông tin chi tiết vào biểu mẫu bên dưới</p>
          </>
        ) : currentView === 'status' ? (
          <>
            <h1>Đề Tài Của Tôi</h1>
            <p>Chi tiết quá trình thực hiện và trạng thái phê duyệt Đề tài</p>
          </>
        ) : (
          <>
            <h1>Thông tin Đợt Đăng Ký</h1>
            <p>Xem các đợt đang mở và tiến hành đăng ký đề tài</p>
          </>
        )}
      </div>

      <Card>
        {currentView === 'periods' && renderPeriodsView()}
        {currentView === 'register' && renderRegisterView()}
        {currentView === 'status' && renderStatusView()}
      </Card>
    </div>
  );
};

export default StudentTheses;
