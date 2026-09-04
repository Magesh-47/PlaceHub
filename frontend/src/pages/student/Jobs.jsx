import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';

const deadlineBadge = (dl) => {
  const days = Math.floor((new Date(dl) - new Date()) / 86400000);
  if (days < 0) return <span className="badge badge-danger">Closed</span>;
  if (days <= 3) return <span className="badge badge-warning">{days}d left</span>;
  if (days <= 7) return <span className="badge badge-info">{days}d left</span>;
  return <span className="badge badge-success">{days}d left</span>;
};

const fieldTypeMap = { NUMBER: 'number', URL: 'url', DATE: 'date', EMAIL: 'email', PHONE: 'tel' };

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('applicationDeadline');

  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appData, setAppData] = useState({});
  const [appFiles, setAppFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ── Debounce search input ───────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ── Fetch ───────────────────────────────────── */
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [sortField, direction] = sortBy.split(',');
      const params = {
        page,
        size: 12,
        sortBy: sortField,
        direction,
        keyword: debouncedSearch || undefined,
        location: locationFilter || undefined,
      };
      const res = await api.get('/student/jobs', { params });
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load jobs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [page, debouncedSearch, locationFilter, sortBy]); // eslint-disable-line

  /* ── Apply ───────────────────────────────────── */
  const openJobDetails = async (jobId) => {
    try {
      const res = await api.get(`/student/jobs/${jobId}`);
      setSelectedJob(res.data);
      setAppData({});
      setAppFiles({});
      setShowModal(true);
    } catch {
      toast.error('Failed to load job details');
    }
  };

  const handleFieldChange = (name, value, isFile = false) => {
    if (isFile) setAppFiles({ ...appFiles, [name]: value });
    else setAppData({ ...appData, [name]: value });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('application', new Blob([JSON.stringify({ jobId: selectedJob.id, fieldValues: appData })], { type: 'application/json' }));
      (selectedJob.customFields || [])
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach((f) => { if (f.fieldType === 'FILE' && appFiles[f.fieldName]) fd.append('file_' + f.fieldName, appFiles[f.fieldName]); });
      await api.post('/student/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully!');
      setShowModal(false);
    } catch (err) {
      toast.error('Application failed: ' + (err.response?.data?.message || err.message));
    }
    setSubmitting(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setLocationFilter('');
    setPage(0);
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div>
      <PageHeader
        title="Browse Jobs"
        subtitle="Explore open opportunities and submit your application"
        actions={
          <div className="search-bar" style={{ minWidth: 240 }}>
            <FiSearch size={14} />
            <input
              type="text"
              placeholder="Search jobs or companies…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Bengaluru, Remote…"
            value={locationFilter}
            onChange={(e) => { setPage(0); setLocationFilter(e.target.value); }}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <label className="form-label">Sort by</label>
          <select className="form-control" value={sortBy} onChange={(e) => { setPage(0); setSortBy(e.target.value); }}>
            <option value="applicationDeadline,asc">Deadline: Soonest first</option>
            <option value="applicationDeadline,desc">Deadline: Latest first</option>
            <option value="createdAt,desc">Recently posted</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<FaBriefcase />}
          title="No jobs found"
          description={searchTerm || locationFilter ? 'Try different search or filter criteria.' : 'No job listings are available right now.'}
          action={
            (searchTerm || locationFilter) && (
              <button className="btn btn-outline btn-sm" onClick={handleClearFilters}>
                <FiX size={13} /> Clear filters
              </button>
            )
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {jobs.map((job) => {
            const days = Math.floor((new Date(job.applicationDeadline) - new Date()) / 86400000);
            return (
              <div
                key={job.id}
                className="card card-hover"
                style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}
              >
                {/* Company + role */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>{job.jobRole}</h3>
                    {deadlineBadge(job.applicationDeadline)}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: 600 }}>{job.companyName}</p>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem', flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <FaMapMarkerAlt size={12} style={{ flexShrink: 0 }} />
                    {job.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <FaMoneyBillWave size={12} style={{ flexShrink: 0 }} />
                    {job.salaryPackage}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <FaCalendarAlt size={12} style={{ flexShrink: 0 }} />
                    Deadline: {job.applicationDeadline}
                    {days >= 0 ? ` (${days} day${days !== 1 ? 's' : ''} left)` : ' (closed)'}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => openJobDetails(job.id)}
                  disabled={days < 0}
                >
                  {days < 0 ? 'Application Closed' : 'View Details & Apply'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && jobs.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <FiChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next <FiChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Job details + application modal */}
      {showModal && selectedJob && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-card-lg animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedJob.jobRole}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: 600 }}>{selectedJob.companyName}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">×</button>
            </div>

            {/* Job details */}
            <div
              style={{
                background: 'var(--bg-body)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.625rem', lineHeight: 1.65 }}>
                {selectedJob.description}
              </p>
              <p style={{ fontSize: '0.8125rem' }}>
                <strong>Eligibility:</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{selectedJob.eligibilityCriteria}</span>
              </p>
            </div>

            {/* Application form */}
            <form onSubmit={handleApply}>
              {selectedJob.customFields?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.875rem' }}>Application Form</p>
                  {[...selectedJob.customFields]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((f) => (
                      <div key={f.id} className="form-group">
                        <label className="form-label">
                          {f.fieldName}{' '}
                          {f.isRequired && <span style={{ color: 'var(--danger)' }}>*</span>}
                        </label>
                        {f.fieldType === 'TEXTAREA' ? (
                          <textarea className="form-control" required={f.isRequired} rows={3}
                            onChange={(e) => handleFieldChange(f.fieldName, e.target.value)} />
                        ) : f.fieldType === 'FILE' ? (
                          <input type="file" className="form-control" required={f.isRequired}
                            onChange={(e) => handleFieldChange(f.fieldName, e.target.files[0], true)} />
                        ) : (
                          <input
                            type={fieldTypeMap[f.fieldType] || 'text'}
                            className="form-control"
                            required={f.isRequired}
                            onChange={(e) => handleFieldChange(f.fieldName, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
