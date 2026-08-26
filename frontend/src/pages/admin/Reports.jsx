import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FiDownload, FiFileText, FiArchive, FiUsers } from 'react-icons/fi';

const Reports = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentDept, setStudentDept] = useState('');
  const [jobId, setJobId] = useState('');
  const [appDept, setAppDept] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [jobRes, stuRes] = await Promise.all([
          api.get('/admin/jobs', { params: { page: 0, size: 200 } }),
          api.get('/admin/students', { params: { page: 0, size: 500 } }),
        ]);
        if (cancelled) return;
        setJobs(jobRes.data.content || []);
        // no endpoint lists departments — derive them from the student records
        setDepartments(
          [...new Set((stuRes.data.content || [])
            .map((s) => s.department)
            .filter(Boolean))].sort()
        );
      } catch (e) {
        if (!cancelled) toast.error('Could not load report options');
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const download = async (key, endpoint, filename, params = {}) => {
    setBusy(key);
    try {
      const res = await api.get(endpoint, { params, responseType: 'blob' });

      // an empty body means the server had nothing to export
      if (!res.data || res.data.size === 0) {
        toast.warning('Nothing to export for that selection');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      // revoking synchronously can abort the download before the browser has
      // read the blob — defer it so the URL outlives the click
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.success('Downloaded ' + filename);
    } catch (err) {
      // the applications endpoints 404 when a job has no applications
      if (err.response?.status === 404) {
        toast.warning('No records found for that selection');
      } else {
        toast.error('Export failed');
      }
      console.error(err);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Loader message="Loading report options…" />;

  const selectedJob = jobs.find((j) => String(j.id) === String(jobId));
  const jobLabel = selectedJob
    ? selectedJob.companyName + '_' + selectedJob.jobRole
    : 'job';

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Export portal records as CSV or ZIP"
      />

      <div className="rep-grid">
        {/* ── students CSV ── */}
        <section className="rep-card">
          <div className="rep-card-head">
            <span className="rep-icon rep-icon--indigo"><FiUsers size={16} /></span>
            <div>
              <h2 className="rep-title">Student directory</h2>
              <p className="rep-sub">Every student profile, optionally narrowed to one department.</p>
            </div>
          </div>

          <label className="form-label" htmlFor="rep-stu-dept">Department</label>
          <select
            id="rep-stu-dept"
            className="form-control"
            value={studentDept}
            onChange={(e) => setStudentDept(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <button
            className="btn btn-primary rep-btn"
            disabled={busy === 'students'}
            onClick={() => download(
              'students',
              '/admin/students/export',
              studentDept ? `students_${studentDept}.csv` : 'students.csv',
              studentDept ? { department: studentDept } : {}
            )}
          >
            <FiDownload size={14} />
            {busy === 'students' ? 'Preparing…' : 'Download CSV'}
          </button>
        </section>

        {/* ── applications CSV + ZIP ── */}
        <section className="rep-card">
          <div className="rep-card-head">
            <span className="rep-icon rep-icon--amber"><FiFileText size={16} /></span>
            <div>
              <h2 className="rep-title">Applications</h2>
              <p className="rep-sub">Applicants for one job — as a spreadsheet, or zipped with their uploads.</p>
            </div>
          </div>

          <label className="form-label" htmlFor="rep-job">Job</label>
          <select
            id="rep-job"
            className="form-control"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          >
            <option value="">Select a job…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.companyName} · {j.jobRole}{j.isActive ? '' : ' (closed)'}
              </option>
            ))}
          </select>

          <label className="form-label" htmlFor="rep-app-dept">Department</label>
          <select
            id="rep-app-dept"
            className="form-control"
            value={appDept}
            onChange={(e) => setAppDept(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <div className="rep-actions">
            <button
              className="btn btn-primary rep-btn"
              disabled={!jobId || busy === 'appcsv'}
              onClick={() => download(
                'appcsv',
                '/admin/applications/export/' + jobId,
                `applications_${jobLabel}.csv`,
                appDept ? { department: appDept } : {}
              )}
            >
              <FiFileText size={14} />
              {busy === 'appcsv' ? 'Preparing…' : 'CSV'}
            </button>

            <button
              className="btn btn-outline rep-btn"
              disabled={!jobId || busy === 'appzip'}
              onClick={() => download(
                'appzip',
                '/admin/applications/export-zip/' + jobId,
                `applications_${jobLabel}.zip`,
                appDept ? { department: appDept } : {}
              )}
            >
              <FiArchive size={14} />
              {busy === 'appzip' ? 'Preparing…' : 'ZIP + files'}
            </button>
          </div>

          {!jobId && <p className="rep-hint">Pick a job to enable the exports.</p>}
        </section>
      </div>
    </div>
  );
};

export default Reports;
