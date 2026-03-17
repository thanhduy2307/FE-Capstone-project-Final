import React, { useState } from 'react';
import './index.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      studentCode: 'SV001',
      email: 'nguyenvana@student.edu.vn',
      class: 'CNTT K15',
      phone: '0911234567',
      major: 'Công nghệ Thông tin',
      status: 'active',
    },
    {
      id: 2,
      name: 'Lê Thị C',
      studentCode: 'SV002',
      email: 'lethic@student.edu.vn',
      class: 'CNTT K15',
      phone: '0912345678',
      major: 'Công nghệ Thông tin',
      status: 'active',
    },
    {
      id: 3,
      name: 'Hoàng Văn E',
      studentCode: 'SV003',
      email: 'hoangvane@student.edu.vn',
      class: 'CNTT K15',
      phone: '0913456789',
      major: 'Công nghệ Thông tin',
      status: 'active',
    },
    {
      id: 4,
      name: 'Trần Văn G',
      studentCode: 'SV004',
      email: 'tranvang@student.edu.vn',
      class: 'CNTT K14',
      phone: '0914567890',
      major: 'Khoa học Máy tính',
      status: 'inactive',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="admin-students">
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý Sinh viên</h1>
          <p>Danh sách và thông tin sinh viên</p>
        </div>
        <button className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm Sinh viên
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
            placeholder="Tìm kiếm theo tên, mã SV hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="active">Đang học</option>
            <option value="inactive">Đã nghỉ</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Tổng số sinh viên</div>
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
            <div className="stat-value">{students.filter(s => s.status === 'active').length}</div>
            <div className="stat-label">Đang học</div>
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
            <div className="stat-value">{students.filter(s => s.status === 'inactive').length}</div>
            <div className="stat-label">Đã nghỉ</div>
          </div>
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Lớp</th>
              <th>Ngành</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  <span className="student-code">{student.studentCode}</span>
                </td>
                <td>
                  <div className="student-name">
                    <div className="student-avatar">
                      {student.name.split(' ').pop().charAt(0)}
                    </div>
                    {student.name}
                  </div>
                </td>
                <td>{student.email}</td>
                <td>{student.class}</td>
                <td>{student.major}</td>
                <td>{student.phone}</td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view" onClick={() => handleViewDetails(student)}>
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

      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Sinh viên</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Mã sinh viên:</label>
                <span>{selectedStudent.studentCode}</span>
              </div>
              <div className="detail-row">
                <label>Họ và tên:</label>
                <span>{selectedStudent.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedStudent.email}</span>
              </div>
              <div className="detail-row">
                <label>Lớp:</label>
                <span>{selectedStudent.class}</span>
              </div>
              <div className="detail-row">
                <label>Ngành:</label>
                <span>{selectedStudent.major}</span>
              </div>
              <div className="detail-row">
                <label>Điện thoại:</label>
                <span>{selectedStudent.phone}</span>
              </div>
              <div className="detail-row">
                <label>Trạng thái:</label>
                <span className={`status-badge ${selectedStudent.status}`}>
                  {selectedStudent.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
