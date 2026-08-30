import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaDownload, FaFileAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';

const AdminApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  /* ── Fetch jobs ─────────────────────────────── */
  useEffect(() => {
    api.get('/admin/jobs?size=100')
      .then((r) => setJobs(r.data.content))
      .catch(() => toast.error('Failed to load jobs'));
  }, []);

  useEffect(() => {
    if (selectedJobId) fetchApplications(selectedJobId, filterDept);
    else setApplications([]);
  }, [selectedJobId]); // eslint-disable-line

  const fetchApplications = async (jobId, dept = filterDept) => {
    setLoading(true);
    try {
      let url = `/admin/applications/job/${jobId}`;
      if (dept) url += `?department=${encodeURIComponent(dept)}`;
      const res = await api.get(url);
      setApplications(res.data);
    } catch {
      toast.error('Failed to load applications');
    }
    setLoading(false);
  };

  const handleDownload = async (applicationId, fieldName, fileName) => {
    try {
      const res = await api.get(`/files/download/${applicationId}/${fieldName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', fileName);
      document.body.appendChild(a); a.click(); a.remove();
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      const res = await api.patch(`/admin/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((app) => (app.applicationId === applicationId ? res.data : app))
      );
      toast.success(`Application ${status === 'ACCEPTED' ? 'accepted' : 'rejected'}`);
    } catch {
      toast.error('Failed to update application status');
    }
    setUpdatingId(null);
  };

  const exportFile = async (endpoint, filename) => {
    if (!selectedJobId) return;
    try {
      const res = await api.get(endpoint, { params: { department: filterDept || null }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', filename);
      document.body.appendChild(a); a.click(); a.remove();
    } catch {
      toast.error('Export failed');
    }
  };

  /* ── Render ─────────────────────────────────── */
  return (
    <div>
      <PageHeader
        title="View Applications"
        subtitle="Review student applications by job listing"
      />

      {/* Job selector + filter */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ marginBottom: selectedJobId ? '0.875rem' : 0 }}>
          <label className="form-label">Select Job to View Applications</label>
          <select className="form-control" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            <option value="">— Select a job —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.companyName} — {j.jobRole}</option>
            ))}
          </select>
        </div>

        {selectedJobId && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label">Filter by Department</label>
              <div className="search-bar">
                <FiSearch size={14} />
                <input
                  type="text"
                  placeholder="e.g. CSE, ECE…"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchApplications(selectedJobId)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => fetchApplications(selectedJobId)}>
              <FiSearch size={13} /> Filter
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {selectedJobId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
              Applications <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({applications.length})</span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => exportFile(`/admin/applications/export/${selectedJobId}`, `applications_job_${selectedJobId}.csv`)}
                disabled={applications.length === 0}
              >
                <FaDownload size={12} /> Export CSV
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportFile(`/admin/applications/export-zip/${selectedJobId}`, `resumes_job_${selectedJobId}.zip`)}
                disabled={applications.length === 0}
              >
                <FaDownload size={12} /> Export ZIP
              </button>
            </div>
          </div>

          {loading ? (
            <Loader message="Loading applications…" />
          ) : (
            <div className="table-container">
              {applications.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Files / Resume</th>
                      <th>Applied At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.applicationId}>
                        <td style={{ fontWeight: 600 }}>{app.studentName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{app.studentEmail}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {app.fileNames && Object.entries(app.fileNames).map(([field, name]) => (
                              <button
                                key={field}
                                onClick={() => handleDownload(app.applicationId, field, name)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                <FaDownload size={10} /> {name}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td><StatusBadge status={app.applicationStatus} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--success-color, #16a34a)', borderColor: 'var(--success-color, #16a34a)' }}
                              disabled={updatingId === app.applicationId || app.applicationStatus === 'ACCEPTED'}
                              onClick={() => handleStatusUpdate(app.applicationId, 'ACCEPTED')}
                              title="Accept application"
                            >
                              <FaCheck size={11} /> Accept
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger-color, #dc2626)', borderColor: 'var(--danger-color, #dc2626)' }}
                              disabled={updatingId === app.applicationId || app.applicationStatus === 'REJECTED'}
                              onClick={() => handleStatusUpdate(app.applicationId, 'REJECTED')}
                              title="Reject application"
                            >
                              <FaTimes size={11} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  icon={<FaFileAlt />}
                  title="No applications found"
                  description="No applications match the current filter criteria."
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminApplications;
