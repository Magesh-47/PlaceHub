import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaKey, FaUserGraduate } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import CustomModal from '../../components/CustomModal';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Loader';
import { toast } from 'react-toastify';
import { avatarGradientFor, badgeColorFor } from '../../utils/colors';
import { useTheme } from '../../context/ThemeContext';

const EMPTY_FORM = {
  username: '', password: '', fullName: '', email: '',
  department: '', year: 1, phone: '', cgpa: 0.0, dateOfBirth: '',
};

const StudentAvatar = ({ student }) => {
  const [url, setUrl] = useState(null);
  const initials = (student.fullName || student.username || '?')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!student.hasProfilePicture) return undefined;
    let objectUrl = null;
    let cancelled = false;
    api.get(`/files/profile-picture/${student.userId}`, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(res.data);
        setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [student.hasProfilePicture, student.userId]);

  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: url ? 'transparent' : avatarGradientFor(student.username || student.fullName),
        fontSize: '0.6875rem', fontWeight: 700, color: '#fff',
      }}
    >
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
};

const DepartmentBadge = ({ department }) => {
  const { theme } = useTheme();
  return (
    <span className="badge" style={badgeColorFor(department, theme)}>
      {department}
    </span>
  );
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');

  // Add / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Confirm modal
  const [confirm, setConfirm] = useState({ isOpen: false, message: '', onConfirm: null });

  // Reset-password modal
  const [resetPw, setResetPw] = useState({ isOpen: false, studentId: null, username: '', newPassword: '' });

  /* ── Fetch ────────────────────────────────────────── */
  const fetchStudents = useCallback(async (name = searchName, dept = searchDept, pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, size: 10 });
      if (name) params.append('name', name);
      if (dept) params.append('department', dept);
      const res = await api.get(`/admin/students?${params}`);
      setStudents(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load students');
    }
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { fetchStudents(searchName, searchDept, page); }, [page]); // eslint-disable-line

  /* ── Handlers ─────────────────────────────────────── */
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStudents(searchName, searchDept, 0);
  };

  const handleClear = () => {
    setSearchName('');
    setSearchDept('');
    setPage(0);
    fetchStudents('', '', 0);
  };

  const openModal = (student = null) => {
    setCurrentStudent(student);
    setFormData(student
      ? { ...EMPTY_FORM, ...student, password: '' }
      : { ...EMPTY_FORM }
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, year: parseInt(formData.year), cgpa: parseFloat(formData.cgpa) };
      if (currentStudent) {
        await api.put(`/admin/students/${currentStudent.userId}`, payload);
        toast.success('Student updated successfully');
      } else {
        await api.post('/admin/students', payload);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      fetchStudents(searchName, searchDept, page);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Unknown error';
      toast.error('Save failed: ' + msg);
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      isOpen: true,
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/students/${id}`);
          toast.success('Student deleted');
          fetchStudents(searchName, searchDept, page);
        } catch (err) {
          toast.error('Delete failed: ' + (err.response?.data?.message || 'Unknown error'));
        }
      },
    });
  };

  const handleResetPassword = async () => {
    if (!resetPw.newPassword) return;
    try {
      await api.put(`/admin/students/${resetPw.studentId}/reset-password`, { newPassword: resetPw.newPassword });
      setResetPw({ isOpen: false, studentId: null, username: '', newPassword: '' });
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error('Reset failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  /* ── Render ───────────────────────────────────────── */
  return (
    <div>
      {/* Confirm */}
      <CustomModal
        isOpen={confirm.isOpen}
        title="Confirm Delete"
        message={confirm.message}
        type="confirm"
        confirmText="Delete"
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm({ ...confirm, isOpen: false })}
      />

      {/* Reset password modal */}
      {resetPw.isOpen && (
        <div className="modal-backdrop" onClick={() => setResetPw({ ...resetPw, isOpen: false })}>
          <div className="modal-card animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password — {resetPw.username}</h3>
              <button className="modal-close" onClick={() => setResetPw({ ...resetPw, isOpen: false })}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={resetPw.newPassword}
                onChange={(e) => setResetPw({ ...resetPw, newPassword: e.target.value })}
                autoFocus
                placeholder="Enter new password"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleResetPassword}>
                Reset Password
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setResetPw({ ...resetPw, isOpen: false })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <PageHeader
        title="Manage Students"
        subtitle="View, add and edit student profiles"
        actions={
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FaPlus size={12} /> Add Student
          </button>
        }
      />

      {/* Filter strip */}
      <form className="filter-strip" onSubmit={handleSearch}>
        <div className="search-bar" style={{ flex: 1, minWidth: 160 }}>
          <FaSearch size={13} />
          <input
            type="text"
            placeholder="Search by name…"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="search-bar" style={{ flex: 1, minWidth: 160 }}>
          <FaSearch size={13} />
          <input
            type="text"
            placeholder="Filter by department…"
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          <FaSearch size={12} /> Search
        </button>
        {(searchName || searchDept) && (
          <button type="button" className="btn btn-outline btn-sm" onClick={handleClear}>
            <FiX size={13} /> Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Department</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>DOB</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={6} cols={8} />
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={<FaUserGraduate />}
                    title="No students found"
                    description="Try adjusting your search or add a new student."
                  />
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.userId}>
                  <td><StudentAvatar student={s} /></td>
                  <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.username}</td>
                  <td><DepartmentBadge department={s.department} /></td>
                  <td>Year {s.year}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: s.cgpa >= 7 ? 'var(--success)' : s.cgpa >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                      {s.cgpa}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.dateOfBirth || '—'}</td>
                  <td>
                    <div className="td-actions" style={{ justifyContent: 'center' }}>
                      <button className="icon-btn" onClick={() => openModal(s)} title="Edit Student">
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="icon-btn warning"
                        onClick={() => setResetPw({ isOpen: true, studentId: s.userId, username: s.username, newPassword: '' })}
                        title="Reset Password"
                      >
                        <FaKey size={13} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(s.userId)} title="Delete">
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && students.length > 0 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span className="pagination-info">Page {page + 1} of {totalPages || 1}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-card-lg animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{currentStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" name="username" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Password {currentStudent && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span>}
                  </label>
                  <input type="password" className="form-control" name="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!currentStudent} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input type="number" className="form-control" value={formData.year} min="1" max="4"
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CGPA</label>
                  <input type="number" step="0.01" className="form-control" value={formData.cgpa} min="0" max="10"
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentStudent ? 'Update Student' : 'Create Student'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
