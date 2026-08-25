import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaBriefcase } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import CustomModal from '../../components/CustomModal';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Loader';

const EMPTY_FORM = {
  companyName: '', jobRole: '', description: '', eligibilityCriteria: '',
  location: '', salaryPackage: '', applicationDeadline: '', isActive: true, customFields: [],
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [confirm, setConfirm] = useState({ isOpen: false, message: '', onConfirm: null });

  /* ── Fetch ───────────────────────────────────── */
  const fetchJobs = async (pg = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/jobs?page=${pg}&size=10`);
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load jobs');
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(page); }, [page]); // eslint-disable-line

  /* ── Handlers ────────────────────────────────── */
  const openModal = (job = null) => {
    setCurrentJobId(job ? job.id : null);
    setFormData(job
      ? { companyName: job.companyName, jobRole: job.jobRole, description: job.description,
          eligibilityCriteria: job.eligibilityCriteria, location: job.location,
          salaryPackage: job.salaryPackage, applicationDeadline: job.applicationDeadline,
          isActive: job.isActive, customFields: job.customFields || [] }
      : { ...EMPTY_FORM }
    );
    setShowModal(true);
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const addField = () =>
    setFormData({ ...formData, customFields: [...formData.customFields, { fieldName: '', fieldType: 'TEXT', isRequired: false, displayOrder: formData.customFields.length }] });

  const removeField = (i) =>
    setFormData({ ...formData, customFields: formData.customFields.filter((_, idx) => idx !== i) });

  const updateField = (i, key, val) =>
    setFormData({ ...formData, customFields: formData.customFields.map((f, idx) => idx === i ? { ...f, [key]: val } : f) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentJobId) {
        await api.put(`/admin/jobs/${currentJobId}`, formData);
        toast.success('Job updated successfully');
      } else {
        await api.post('/admin/jobs', formData);
        toast.success('Job posted successfully');
      }
      setShowModal(false);
      fetchJobs(page);
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      isOpen: true,
      message: 'Are you sure? This will delete the job and all related applications.',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/jobs/${id}`);
          toast.success('Job deleted');
          fetchJobs(page);
        } catch (err) {
          toast.error('Delete failed: ' + (err.response?.data?.message || 'Unknown error'));
        }
      },
    });
  };

  const deadlineInfo = (dl) => {
    if (!dl) return null;
    const days = Math.floor((new Date(dl) - new Date()) / 86400000);
    if (days < 0) return <span className="badge badge-danger">Closed</span>;
    if (days <= 3) return <span className="badge badge-warning">{days}d left</span>;
    return <span className="badge badge-success">{days}d left</span>;
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div>
      <CustomModal
        isOpen={confirm.isOpen}
        title="Confirm Delete"
        message={confirm.message}
        type="confirm"
        confirmText="Delete"
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm({ ...confirm, isOpen: false })}
      />

      <PageHeader
        title="Manage Jobs"
        subtitle="Post new listings and manage recruitment drives"
        actions={
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FaPlus size={12} /> Post Job
          </button>
        }
      />

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Location</th>
              <th>Deadline</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={<FaBriefcase />} title="No jobs posted yet" description="Create your first job listing to start receiving applications." />
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 600 }}>{job.companyName}</td>
                  <td>{job.jobRole}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{job.location}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{job.applicationDeadline}</span>
                      {deadlineInfo(job.applicationDeadline)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${job.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions" style={{ justifyContent: 'center' }}>
                      <button className="icon-btn" onClick={() => openModal(job)} title="Edit Job">
                        <FaEdit size={14} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(job.id)} title="Delete Job">
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
      {!loading && jobs.length > 0 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <span className="pagination-info">Page {page + 1} of {totalPages || 1}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {/* Post / Edit Job Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-card-xl animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{currentJobId ? 'Edit Job' : 'Post New Job'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-control" name="companyName" value={formData.companyName} onChange={handleInput} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Role</label>
                  <input type="text" className="form-control" name="jobRole" value={formData.jobRole} onChange={handleInput} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formData.description} onChange={handleInput} required rows={3} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label">Eligibility Criteria</label>
                  <input type="text" className="form-control" name="eligibilityCriteria" value={formData.eligibilityCriteria} onChange={handleInput} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" name="location" value={formData.location} onChange={handleInput} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Package</label>
                  <input type="text" className="form-control" name="salaryPackage" value={formData.salaryPackage} onChange={handleInput} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input type="date" className="form-control" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleInput} required />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInput} />
                  Active Listing (visible to students)
                </label>
              </div>

              {/* Custom Fields */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Custom Application Fields</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addField}>
                    <FaPlus size={11} /> Add Field
                  </button>
                </div>
                {formData.customFields.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '0.5rem' }}>
                    No custom fields added yet.
                  </p>
                )}
                {formData.customFields.map((cf, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Field Name" className="form-control" value={cf.fieldName}
                      onChange={(e) => updateField(i, 'fieldName', e.target.value)} required />
                    <select className="form-control" value={cf.fieldType} onChange={(e) => updateField(i, 'fieldType', e.target.value)}>
                      <option value="TEXT">Text</option>
                      <option value="TEXTAREA">Textarea</option>
                      <option value="NUMBER">Number</option>
                      <option value="URL">URL</option>
                      <option value="DATE">Date</option>
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone</option>
                      <option value="FILE">File / Resume</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <input type="checkbox" checked={cf.isRequired} onChange={(e) => updateField(i, 'isRequired', e.target.checked)} />
                      Required
                    </label>
                    <button type="button" className="icon-btn danger" onClick={() => removeField(i)} title="Remove field">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentJobId ? 'Update Job' : 'Post Job'}
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

export default AdminJobs;
