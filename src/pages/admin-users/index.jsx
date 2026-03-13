import React, { useEffect, useState } from 'react';
import authService from '../../services/authService.js';
import './index.css';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  STUDENT: 'Sinh vien',
  LECTURER: 'Giang vien',
  MODERATOR: 'Moderator',
};

const ROLE_COLORS = {
  ADMIN: 'role-admin',
  STUDENT: 'role-student',
  LECTURER: 'role-lecturer',
  MODERATOR: 'role-moderator',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createForm, setCreateForm] = useState({ email: '', password: '', fullName: '', role: 'STUDENT' });

  const [editRoleUser, setEditRoleUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleUpdateError, setRoleUpdateError] = useState(null);
  const [roleUpdateSuccess, setRoleUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Khong the tai danh sach nguoi dung. Vui long thu lai.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const ROLE_ORDER = { ADMIN: 1, LECTURER: 2, MODERATOR: 3, STUDENT: 4 };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || '').includes(searchTerm);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const orderA = ROLE_ORDER[a.role] ?? 99;
      const orderB = ROLE_ORDER[b.role] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.fullName || '').localeCompare(b.fullName || '', 'vi');
    });

  const uniqueRoles = Object.keys(ROLE_LABELS).filter((r) => users.some((u) => u.role === r));

  const handleViewDetails = (user) => { setSelectedUser(user); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedUser(null); };
  const handleOpenRoleModal = (user) => { setEditRoleUser(user); setNewRole(user.role); setRoleUpdateError(null); setRoleUpdateSuccess(false); setShowRoleModal(true); };
  const handleCloseRoleModal = () => { setShowRoleModal(false); setEditRoleUser(null); setNewRole(''); setRoleUpdateError(null); setRoleUpdateSuccess(false); };

  const handleOpenCreateModal = () => { setCreateForm({ email: '', password: '', fullName: '', role: 'STUDENT' }); setCreateError(null); setShowCreateModal(true); };
  const handleCloseCreateModal = () => { setShowCreateModal(false); setCreateError(null); };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await authService.register(createForm);
      const newEntry = result?.user || result;
      if (newEntry && (newEntry.id || newEntry.email)) {
        setUsers((prev) => [...prev, newEntry]);
      }
      setShowCreateModal(false);
      alert('Dang ky tai khoan thanh cong!');
    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError(err?.response?.data?.message || 'Tao nguoi dung that bai. Vui long thu lai.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editRoleUser || !newRole || newRole === editRoleUser.role) return;
    setIsUpdatingRole(true);
    setRoleUpdateError(null);
    try {
      await authService.updateUserRole(editRoleUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === editRoleUser.id ? { ...u, role: newRole } : u)));
      setRoleUpdateSuccess(true);
      setTimeout(() => handleCloseRoleModal(), 1200);
    } catch (err) {
      console.error('Error updating role:', err);
      setRoleUpdateError(err?.response?.data?.message || 'Cap nhat vai tro that bai. Vui long thu lai.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm('Ban co chac muon xoa nguoi dung nay khong?')) return;
    try {
      await authService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert('Xoa nguoi dung thanh cong!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err?.response?.data?.message || 'Xoa nguoi dung that bai. Vui long thu lai.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const inputStyle = { padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: '14px', width: '100%', boxSizing: 'border-box' };

  return (
    <div className="admin-users">
      <div className="page-header">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>Quan ly Nguoi dung</h1>
            <p>Danh sach toan bo nguoi dung trong he thong</p>
          </div>
          <button onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Dang ky nguoi dung
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Tim kiem theo ten, email, ma SV hoac SDT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Vai tro:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tat ca</option>
            {uniqueRoles.map((role) => (<option key={role} value={role}>{ROLE_LABELS[role] || role}</option>))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="stat-content"><div className="stat-value">{users.length}</div><div className="stat-label">Tong nguoi dung</div></div>
        </div>
        {uniqueRoles.slice(0, 3).map((role) => (
          <div className="stat-card" key={role}>
            <div className="stat-icon" style={{ background: role === 'ADMIN' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : role === 'STUDENT' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <div className="stat-content"><div className="stat-value">{users.filter((u) => u.role === role).length}</div><div className="stat-label">{ROLE_LABELS[role] || role}</div></div>
          </div>
        ))}
      </div>

      {isLoading && (<div className="loading-container"><div className="spinner" /><p>Dang tai du lieu...</p></div>)}
      {error && (<div className="error-container"><p>{error}</p><button className="btn-primary" onClick={() => window.location.reload()}>Thu lai</button></div>)}

      {!isLoading && !error && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr><th>ID</th><th>Ho va ten</th><th>Email</th><th>Dien thoai</th><th>Khoa</th><th>Vai tro</th><th>Ngay tao</th><th>Thao tac</th></tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">Khong tim thay nguoi dung nao.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><span className="user-id">#{user.id}</span></td>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">{(user.fullName || user.email || '?').charAt(0).toUpperCase()}</div>
                        <div><div className="user-fullname">{user.fullName || '---'}</div>{user.studentCode && <div className="user-student-code">{user.studentCode}</div>}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '---'}</td>
                    <td>{user.department || '---'}</td>
                    <td><span className={`role-badge ${ROLE_COLORS[user.role] || ''}`}>{ROLE_LABELS[user.role] || user.role}</span></td>
                    <td className="date-cell">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action view" onClick={() => handleViewDetails(user)} title="Xem chi tiet">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button className="btn-action edit" onClick={() => handleOpenRoleModal(user)} title="Cap nhat vai tro">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        <button className="btn-action delete" onClick={() => handleDeleteUser(user)} title="Xoa nguoi dung">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer"><span>Hien thi <strong>{filteredUsers.length}</strong> / {users.length} nguoi dung</span></div>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Thong tin Nguoi dung</h2><button className="close-btn" onClick={handleCloseModal}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button></div>
            <div className="modal-body">
              <div className="modal-user-header">
                <div className="modal-avatar">{(selectedUser.fullName || selectedUser.email || '?').charAt(0).toUpperCase()}</div>
                <div><h3>{selectedUser.fullName || '---'}</h3><span className={`role-badge ${ROLE_COLORS[selectedUser.role] || ''}`}>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</span></div>
              </div>
              <div className="detail-row"><label>ID:</label><span>#{selectedUser.id}</span></div>
              <div className="detail-row"><label>Email:</label><span>{selectedUser.email}</span></div>
              <div className="detail-row"><label>Ho va ten:</label><span>{selectedUser.fullName || '---'}</span></div>
              <div className="detail-row"><label>Dien thoai:</label><span>{selectedUser.phone || '---'}</span></div>
              <div className="detail-row"><label>Khoa:</label><span>{selectedUser.department || '---'}</span></div>
              <div className="detail-row"><label>Ma sinh vien:</label><span>{selectedUser.studentCode || '---'}</span></div>
              <div className="detail-row"><label>Ngay tao:</label><span>{formatDate(selectedUser.createdAt)}</span></div>
              <div className="detail-row"><label>Cap nhat lan cuoi:</label><span>{formatDate(selectedUser.updatedAt)}</span></div>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && editRoleUser && (
        <div className="modal-overlay" onClick={handleCloseRoleModal}>
          <div className="modal-content role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Cap nhat Vai tro</h2><button className="close-btn" onClick={handleCloseRoleModal}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button></div>
            <div className="modal-body">
              <div className="modal-user-header">
                <div className="modal-avatar">{(editRoleUser.fullName || editRoleUser.email || '?').charAt(0).toUpperCase()}</div>
                <div><h3>{editRoleUser.fullName || editRoleUser.email}</h3><p className="role-modal-email">{editRoleUser.email}</p></div>
              </div>
              <div className="role-update-form">
                <label className="role-select-label">Vai tro hien tai</label>
                <span className={`role-badge ${ROLE_COLORS[editRoleUser.role] || ''}`}>{ROLE_LABELS[editRoleUser.role] || editRoleUser.role}</span>
                <label className="role-select-label" style={{ marginTop: '1.25rem' }}>Vai tro moi</label>
                <select className="role-select" value={newRole} onChange={(e) => setNewRole(e.target.value)} disabled={isUpdatingRole}>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                </select>
                {roleUpdateError && (<div className="role-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{roleUpdateError}</div>)}
                {roleUpdateSuccess && (<div className="role-success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>Cap nhat vai tro thanh cong!</div>)}
              </div>
              <div className="role-modal-actions">
                <button className="btn-cancel" onClick={handleCloseRoleModal} disabled={isUpdatingRole}>Huy</button>
                <button className="btn-update-role" onClick={handleUpdateRole} disabled={isUpdatingRole || newRole === editRoleUser.role || roleUpdateSuccess}>
                  {isUpdatingRole ? (<><span className="btn-spinner" /> Dang cap nhat...</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>Cap nhat</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Dang ky Nguoi dung Moi</h2>
              <button className="close-btn" onClick={handleCloseCreateModal}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {createError && (<div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>{createError}</div>)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Ho va ten *</label>
                <input type="text" value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Nguyen Van A" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Email *</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} placeholder="example@fpt.edu.vn" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Mat khau *</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} placeholder="Toi thieu 6 ky tu" required minLength={6} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>Vai tro *</label>
                <select value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))} style={inputStyle}>
                  {Object.entries(ROLE_LABELS).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={handleCloseCreateModal} disabled={isCreating} style={{ padding: '9px 20px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Huy</button>
                <button type="submit" disabled={isCreating} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isCreating ? 'Dang tao...' : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Tao tai khoan</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;