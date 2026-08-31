import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaDownload, FaClipboardList, FaSearch } from 'react-icons/fa';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/applications')
      .then((r) => setApplications(r.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <Loader message="Loading your applications…" />;

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Track the status of all your submitted applications"
      />

      {applications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FaClipboardList />}
            title="No applications yet"
            description="You haven't applied to any jobs yet. Browse open listings to get started."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/jobs')}>
                <FaSearch size={12} /> Browse Jobs
              </button>
            }
          />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Files</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 600 }}>{app.companyName}</td>
                  <td>{app.jobRole}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {app.fileNames && Object.entries(app.fileNames).map(([field, name]) => (
                        <button
                          key={field}
                          onClick={() => handleDownload(app.applicationId, field, name)}
                          style={{
                            background: 'none', border: 'none',
                            color: 'var(--primary-color)', cursor: 'pointer',
                            fontSize: '0.8125rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            padding: 0,
                          }}
                          title={`Download ${name}`}
                        >
                          <FaDownload size={11} /> {name}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td><StatusBadge status={app.applicationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
