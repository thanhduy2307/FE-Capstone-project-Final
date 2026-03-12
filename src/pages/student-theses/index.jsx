import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Input from '../../components/Input.jsx';
import useAuthStore from '../../stores/authStore.js';
import useSemesterStore from '../../stores/semesterStore.js';
import usePeriodStore from '../../stores/periodStore.js';
import './student-theses.css';

const StudentTheses = () => {
  const { user } = useAuthStore();
  const { activeSemester, fetchActiveSemester } = useSemesterStore();
  const { periods: openPeriods, fetchOpenPeriods } = usePeriodStore();
  
  // Dummy data. In a real app we fetch this from API.
  const [hasThesis, setHasThesis] = useState(false);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  // views: 'periods' | 'register' | 'status'
  const [currentView, setCurrentView] = useState('periods');

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
  
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setHasThesis(true);
    setCurrentView('status');
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
        <Button variant="secondary" onClick={() => setCurrentView('periods')}>Trở lại</Button>
        <h3 style={{ margin: 0 }}>Đăng ký Đề Tài Mới</h3>
      </div>
      <form onSubmit={handleRegisterSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label><strong>Chọn Đợt Đăng Ký:</strong></label>
          <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', marginTop: '8px' }} required>
            <option value="">-- Chọn đợt nộp --</option>
            {openPeriods.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Hạn: {new Date(p.endDate).toLocaleDateString('vi-VN')})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tên đề tài:</label>
          <Input placeholder="Nhập tên đề tài..." required />
        </div>
        <div className="form-group">
          <label>Miêu tả đề tài:</label>
          <textarea 
            placeholder="Mô tả ngắn gọn về đề tài..." 
            rows={4} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', marginTop: '8px', resize: 'vertical' }}
            required 
          />
        </div>
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label>Mã ngành:</label>
            <Input placeholder="VD: SE, IA, AI..." required />
          </div>
          <div>
            <label>Giảng viên Hướng dẫn đề xuất:</label>
            <Input placeholder="Tên hoặc mã giảng viên..." />
          </div>
        </div>
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label>Tên nhóm:</label>
            <Input placeholder="Nhập tên nhóm..." required />
          </div>
          <div>
            <label>Số lượng thành viên:</label>
            <Input type="number" min="1" max="5" placeholder="Ví dụ: 3" required />
          </div>
        </div>
        <div className="form-group">
          <label>File Đề cương dự kiến (PDF/DOCX):</label>
          <input type="file" style={{ color: 'var(--text-primary)', marginTop: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button type="submit" variant="primary">Nộp Đề Tài</Button>
          <Button type="button" variant="secondary" onClick={() => setCurrentView('periods')}>Hủy</Button>
        </div>
      </form>
    </div>
  );

  const renderStatusView = () => (
    <div>
      <h3>Chi tiết Đề tài: Phát triển nền tảng học tập trực tuyến kết hợp AI</h3>
      <hr style={{borderColor: 'var(--border-color)', margin: '15px 0'}} />
      <div style={{display: 'flex', gap: '40px', lineHeight: '2'}}>
        <div>
          <p><strong>Mã Đề tài:</strong> DT2024099</p>
          <p><strong>Nhóm:</strong> FPT Heroes (3 Thành viên)</p>
          <p><strong>Mã ngành:</strong> SE</p>
          <p><strong>Giảng viên HD:</strong> PGS.TS Nguyễn Văn A</p>
        </div>
        <div>
          <p><strong>Trình trạng nộp:</strong> Đã gửi biên bản đề xuất</p>
          <p>
            <strong>Đánh giá AI:</strong> <Badge variant="success">95/100 Điểm (PASS)</Badge>
          </p>
          <p>
            <strong>Trạng thái phê duyệt:</strong> <Badge variant="warning">PENDING (Chờ duyệt)</Badge>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '10px' }}>Kết quả Đăng ký Đề tài</h4>
        <p>
          Đề tài của bạn đã vượt qua vòng đánh giá AI (<strong>PASS</strong>) và đang trong quá trình chờ phê duyệt bởi Hội đồng chuyên môn (Moderator).
          Bạn sẽ nhận được thông báo khi có kết quả chính thức.
        </p>
      </div>

      <div style={{marginTop: '30px'}}>
        <h4>Nộp bản hoàn chỉnh</h4>
        <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px'}}>
          Vui lòng nộp báo cáo hoàn thiện theo yêu cầu của Giảng viên HD (áp dụng sau khi được duyệt).
        </p>
        <input type="file" style={{ color: 'var(--text-primary)', marginTop: '8px'}} />
        <Button size="sm" variant="primary" style={{marginTop: '15px', display: 'block'}}>Upload Báo Cáo</Button>
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
