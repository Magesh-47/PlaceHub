import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { avatarGradientFor } from '../../utils/colors';
import { daysUntil, relTime, STATUS_TONE } from '../../utils/dates';
import {
  FiFileText, FiClock, FiAward, FiTrendingUp,
  FiAlertTriangle, FiCheckCircle, FiCircle,
} from 'react-icons/fi';

const CHECKLIST_ITEMS = [
  { key: 'picture', label: 'Profile picture' },
  { key: 'summary', label: 'Professional summary' },
  { key: 'education', label: 'Education' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'links', label: 'Links' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [data, setData] = useState({ profile: null, details: null, applications: [], jobs: [] });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profileRes, detailsRes, appsRes, jobsRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/profile/details'),
          api.get('/student/applications'),
          api.get('/student/jobs', { params: { page: 0, size: 200, sortBy: 'applicationDeadline', direction: 'asc' } }),
        ]);

        if (cancelled) return;
        setData({
          profile: profileRes.data,
          details: detailsRes.data,
          applications: appsRes.data || [],
          jobs: jobsRes.data.content || [],
        });
      } catch (e) {
        if (!cancelled) setFailed(true);
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader />;

  if (failed) {
    return (
      <div className="card dash-fail">
        <FiAlertTriangle size={24} />
        <p className="dash-fail-title">Couldn&rsquo;t load dashboard data</p>
        <p className="dash-fail-sub">The portal API did not respond. Try reloading the page.</p>
      </div>
    );
  }

  const { profile, details, applications, jobs } = data;

  const byStatus = applications.reduce((acc, a) => {
    const k = a.applicationStatus || 'PENDING';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const pendingCount = (byStatus.SUBMITTED || 0) + (byStatus.PENDING || 0);
  const acceptedCount = byStatus.ACCEPTED || 0;

  const checklist = CHECKLIST_ITEMS.map((item) => {
    switch (item.key) {
      case 'picture': return { ...item, done: !!profile.hasProfilePicture };
      case 'summary': return { ...item, done: !!details.summary };
      case 'education': return { ...item, done: (details.education || []).length > 0 };
      case 'experience': return { ...item, done: (details.experience || []).length > 0 };
      case 'skills': return { ...item, done: (details.skills || []).length > 0 };
      case 'certifications': return { ...item, done: (details.certifications || []).length > 0 };
      case 'links': return { ...item, done: (details.links || []).length > 0 };
      default: return { ...item, done: false };
    }
  });
  const completedCount = checklist.filter((c) => c.done).length;
  const completenessPct = Math.round((completedCount / checklist.length) * 100);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const closingSoon = jobs
    .filter((j) => j.isActive && !appliedJobIds.has(j.id))
    .map((j) => ({ job: j, days: daysUntil(j.applicationDeadline) }))
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const recent = [...applications]
    .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
    .slice(0, 6);

  const stats = [
    { label: 'Applications', value: applications.length, tone: 'indigo',
      icon: <FiFileText size={17} />, foot: pendingCount + ' pending review' },
    { label: 'Pending Review', value: pendingCount, tone: 'amber',
      icon: <FiClock size={17} />, foot: 'awaiting a decision' },
    { label: 'Accepted', value: acceptedCount, tone: 'emerald',
      icon: <FiAward size={17} />, foot: acceptedCount === 1 ? 'offer received' : 'offers received' },
    { label: 'Profile Strength', value: completenessPct + '%', tone: 'violet',
      icon: <FiTrendingUp size={17} />, foot: completedCount + ' of ' + checklist.length + ' sections complete' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="dash-head">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.username}</strong>. Here&rsquo;s where things stand.
        </p>
      </div>

      {/* ── stat row ── */}
      <div className="dash-stats">
        {stats.map((s) => (
          <div className={'dash-stat dash-stat--' + s.tone} key={s.label}>
            <div className="dash-stat-top">
              <span className="dash-stat-icon">{s.icon}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-foot">{s.foot}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* ── application status ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Application status</h2>
            <span className="dash-panel-meta">{applications.length} total</span>
          </header>

          {applications.length === 0 ? (
            <p className="dash-none">You haven&rsquo;t applied to any jobs yet.</p>
          ) : (
            <>
              <div className="dash-meter">
                {Object.entries(byStatus).map(([k, v]) => (
                  <span
                    key={k}
                    className={'dash-meter-seg dash-meter-seg--' + (STATUS_TONE[k] || 'info')}
                    style={{ width: (v / applications.length) * 100 + '%' }}
                    title={k + ': ' + v}
                  />
                ))}
              </div>
              <ul className="dash-legend">
                {Object.entries(byStatus).map(([k, v]) => (
                  <li key={k}>
                    <span className={'dash-dot dash-dot--' + (STATUS_TONE[k] || 'info')} />
                    <span className="dash-legend-k">{k.toLowerCase()}</span>
                    <span className="dash-legend-v">{v}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* ── closing soon ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Closing soon</h2>
            <span className="dash-panel-meta">not yet applied</span>
          </header>

          {closingSoon.length === 0 ? (
            <p className="dash-none">Nothing urgent — you&rsquo;re all caught up.</p>
          ) : (
            <ul className="dash-list">
              {closingSoon.map(({ job, days }) => (
                <li className="dash-list-row" key={job.id}>
                  <span className={'dash-chip' + (days <= 7 ? ' dash-chip--urgent' : '')}>
                    <FiClock size={11} />
                    {days === 0 ? 'today' : days === 1 ? '1 day' : days + ' days'}
                  </span>
                  <Link to="/student/jobs" className="dash-list-main" style={{ textDecoration: 'none' }}>
                    <span className="dash-list-title">{job.companyName}</span>
                    <span className="dash-list-sub">{job.jobRole} · {job.location}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── recent applications ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Recent applications</h2>
            <span className="dash-panel-meta">most recent</span>
          </header>

          {recent.length === 0 ? (
            <p className="dash-none">Nothing submitted yet.</p>
          ) : (
            <ul className="dash-list">
              {recent.map((a) => (
                <li className="dash-list-row" key={a.applicationId}>
                  <span className="dash-avatar" style={{ background: avatarGradientFor(a.companyName) }}>
                    {(a.companyName || '?').trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="dash-list-main">
                    <span className="dash-list-title">{a.companyName}</span>
                    <span className="dash-list-sub">{a.jobRole}</span>
                  </div>
                  <span className="dash-list-time">{relTime(a.appliedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── profile checklist ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Complete your profile</h2>
            <span className="dash-panel-meta">{completedCount}/{checklist.length}</span>
          </header>

          <div className="dash-list">
            {checklist.map((item) => (
              <Link
                to="/student/profile"
                key={item.key}
                className="dash-list-row"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                {item.done
                  ? <FiCheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  : <FiCircle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                <div className="dash-list-main">
                  <span className="dash-list-title" style={{ color: item.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {item.label}
                  </span>
                </div>
                {!item.done && <span className="dash-list-time">Add now</span>}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
