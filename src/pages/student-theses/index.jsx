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
import { useNavigate, useLocation } from 'react-router-dom';
import './student-theses.css';

const StudentTheses = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods } = usePeriodStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
  const [thesisDetail, setThesisDetail] = useState(null);

  // views: 'periods' | 'register'
  const [currentView, setCurrentView] = useState('periods');
  const [formMode, setFormMode] = useState('register'); // 'register' | 'edit' | 'resubmit'

  // Form state
  const [formData, setFormData] = useState({
    registrationPhaseId: '',
    titleEn: '',
    titleVi: '',
    description: '',
    department: '',
  });
  
  // Dynamic student list instead of raw JSON string
  const [studentsList, setStudentsList] = useState([
    { name: '', code: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSemesterData();
  }, []);

  // Handle Edit / Resubmit from My Thesis page
  useEffect(() => {
    if (location.state && location.state.thesisDetail) {
      const { thesisDetail: incomingThesis, mode } = location.state;
      setThesisDetail(incomingThesis);
      setFormMode(mode || 'edit');
      setCurrentView('register');
      
      setFormData({
        registrationPhaseId: incomingThesis.registrationPhaseId || '',
        titleEn: incomingThesis.titleEn || '',
        titleVi: incomingThesis.titleVi || '',
        description: incomingThesis.description || '',
        department: incomingThesis.department || '',
      });
      
      if (incomingThesis.studentGroupInfo) {
        try {
          const parsed = JSON.parse(incomingThesis.studentGroupInfo);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudentsList(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse existing student group info', e);
        }
      }
    }
  }, [location.state]);

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

  // Student List Handlers
  const handleStudentChange = (index, field, value) => {
    const newList = [...studentsList];
    newList[index][field] = value;
    setStudentsList(newList);
  };

  const handleAddStudent = () => {
    if (studentsList.length < 5) {
      setStudentsList([...studentsList, { name: '', code: '' }]);
    } else {
      showWarning('Số lượng thành viên tối đa là 5.');
    }
  };

  const handleRemoveStudent = (index) => {
    if (studentsList.length > 1) {
      const newList = studentsList.filter((_, i) => i !== index);
      setStudentsList(newList);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!activeSemester) {
      showWarning('Không tìm thấy Học kỳ hiện tại.');
      return;
    }

    // Validate students have both name and code
    const invalidStudent = studentsList.find(s => !s.name.trim() || !s.code.trim());
    if (invalidStudent) {
      showWarning('Vui lòng nhập đầy đủ Tên và Mã số cho tất cả thành viên trong nhóm.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Auto-format studentsList into JSON string
      const formattedGroupInfo = JSON.stringify(studentsList);

      // Construct payload according to API spec
      const payload = {
        semesterId: activeSemester.id,
        registrationPhaseId: parseInt(formData.registrationPhaseId),
        titleEn: formData.titleEn,
        titleVi: formData.titleVi,
        description: formData.description,
        department: formData.department,
        studentGroupInfo: formattedGroupInfo,
        studentCount: studentsList.length
      };

      if (formMode === 'edit' && thesisDetail) {
        const updated = await thesisService.updateThesis(thesisDetail.id, payload);
        const updatedId = updated?.id || thesisDetail.id;
        localStorage.setItem('myTopicId', updatedId);
        showSuccess('Cập nhật đề tài thành công!');
      } else if (formMode === 'resubmit' && thesisDetail) {
        const resubmitted = await thesisService.resubmitStudentThesis(thesisDetail.id, payload);
        const resubmittedId = resubmitted?.id || thesisDetail.id;
        localStorage.setItem('myTopicId', resubmittedId);
        showSuccess('Nộp lại đề tài thành công!');
      } else {
        const created = await thesisService.createStudentThesis(payload);
        if (created?.id) {
          localStorage.setItem('myTopicId', created.id);
        }
        showSuccess('Nộp đề tài thành công! Vui lòng chờ phản hồi.');
      }
      
      // Navigate to the My Thesis page instead of local state swap
      navigate('/student/my-thesis');
    } catch (error) {
      console.error('Failed to submit thesis:', error);
      showError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi nộp đề tài.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setFormMode('edit');
    setCurrentView('register');
  };

  const handleResubmitClick = () => {
    setFormMode('resubmit');
    setCurrentView('register');
  };

  const handleCancelForm = () => {
    setCurrentView('periods');
    // Reset form
    setFormData({
      registrationPhaseId: '',
      titleEn: '',
      titleVi: '',
      description: '',
      department: '',
    });
    setStudentsList([{ name: '', code: '' }]);
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
        <div className="form-group" style={{ display: 'grid', gap: '20px', marginTop: '15px' }}>
          <div>
            <label>Mã ngành:</label>
            <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="VD: SE, IA, AI..." required />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label style={{ margin: 0, fontWeight: 600 }}>Thông tin thành viên nhóm:</label>
            <Badge variant="default">Số lượng: {studentsList.length}</Badge>
          </div>
          
          {studentsList.map((student, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Họ và Tên SV {index + 1}:</label>
                <Input 
                  value={student.name} 
                  onChange={(e) => handleStudentChange(index, 'name', e.target.value)} 
                  placeholder="VD: Nguyễn Văn A" 
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Mã số SV {index + 1}:</label>
                <Input 
                  value={student.code} 
                  onChange={(e) => handleStudentChange(index, 'code', e.target.value)} 
                  placeholder="VD: SE17001" 
                  required 
                />
              </div>
              {studentsList.length > 1 && (
                <Button 
                  type="button" 
                  variant="danger" 
                  onClick={() => handleRemoveStudent(index)}
                  style={{ padding: '10px 15px' }}
                >
                  Xóa
                </Button>
              )}
            </div>
          ))}
          
          {studentsList.length < 5 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddStudent} 
              style={{ marginTop: '5px', width: '100%', borderStyle: 'dashed' }}
            >
              + Thêm thành viên
            </Button>
          )}
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

  return (
    <div className="student-theses">
      <div className="page-header">
        {currentView === 'register' ? (
          <>
            <h1>Đăng Ký Đề Tài Mới</h1>
            <p>Điền thông tin chi tiết vào biểu mẫu bên dưới</p>
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
      </Card>
    </div>
  );
};

export default StudentTheses;
