import React, { useState } from 'react';
import './index.css';

const AdminLecturers = () => {
  const [lecturers, setLecturers] = useState([
    {
      id: 1,
      name: 'TS. Nguyễn Văn B',
      email: 'nguyenvanb@university.edu.vn',
      department: 'Khoa Công nghệ Thông tin',
      phone: '0901234567',
      specialization: 'Trí tuệ nhân tạo',
      status: 'active',
    },
    {
      id: 2,
      name: 'PGS.TS. Trần Thị D',
      email: 'tranthid@university.edu.vn',
      department: 'Khoa Công nghệ Thông tin',
      phone: '0902345678',
      specialization: 'Khoa học dữ liệu',
      status: 'active',
    },
    {
      id: 3,
      name: 'TS. Lê Văn F',
      email: 'levanf@university.edu.vn',
      department: 'Khoa Công nghệ Thông tin',
      phone: '0903456789',
      specialization: 'An toàn thông tin',
      status: 'inactive',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch = lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lecturer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (lecturer) => {
    setSelectedLecturer(lecturer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLecturer(null);
  };

  return (
    <div className="admin-lecturers">
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý Giảng viên</h1>
          <p>Danh sách và thông tin giảng viên</p>
        </div>
        <button className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm Giảng viên
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{lecturers.length}</div>
            <div className="stat-label">Tổng số giảng viên</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{lecturers.filter(l => l.status === 'active').length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{lecturers.filter(l => l.status === 'inactive').length}</div>
            <div className="stat-label">Ngưng hoạt động</div>
          </div>
        </div>
      </div>

      <div className="lecturers-table-container">
        <table className="lecturers-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Khoa</th>
              <th>Chuyên môn</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredLecturers.map((lecturer) => (
              <tr key={lecturer.id}>
                <td>
                  <div className="lecturer-name">
                    <div className="lecturer-avatar">
                      {lecturer.name.split(' ').pop().charAt(0)}
                    </div>
                    {lecturer.name}
                  </div>
                </td>
                <td>{lecturer.email}</td>
                <td>{lecturer.department}</td>
                <td>{lecturer.specialization}</td>
                <td>{lecturer.phone}</td>
                <td>
                  <span className={`status-badge ${lecturer.status}`}>
                    {lecturer.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view" onClick={() => handleViewDetails(lecturer)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button className="btn-action edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="btn-action delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedLecturer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Giảng viên</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Họ và tên:</label>
                <span>{selectedLecturer.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedLecturer.email}</span>
              </div>
              <div className="detail-row">
                <label>Khoa:</label>
                <span>{selectedLecturer.department}</span>
              </div>
              <div className="detail-row">
                <label>Chuyên môn:</label>
                <span>{selectedLecturer.specialization}</span>
              </div>
              <div className="detail-row">
                <label>Điện thoại:</label>
                <span>{selectedLecturer.phone}</span>
              </div>
              <div className="detail-row">
                <label>Trạng thái:</label>
                <span className={`status-badge ${selectedLecturer.status}`}>
                  {selectedLecturer.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLecturers;
