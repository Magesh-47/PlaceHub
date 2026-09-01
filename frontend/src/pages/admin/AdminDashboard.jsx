import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { avatarGradientFor, badgeColorFor } from '../../utils/colors';
import { daysUntil, relTime, STATUS_TONE } from '../../utils/dates';
import {
  FiUsers, FiBriefcase, FiFileText, FiTrendingUp,
  FiAlertTriangle, FiClock, FiAward,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [data, setData] = useState({ students: 0, jobs: [], apps: [] });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // there is no aggregate/stats endpoint for per-job data — compose from the paginated ones
        const [stuRes, jobRes, statsRes] = await Promise.all([
          api.get('/admin/students', { params: { page: 0, size: 1 } }),
          api.get('/admin/jobs', { params: { page: 0, size: 200 } }),
          api.get('/admin/dashboard/stats'),
        ]);

        const jobs = jobRes.data.content || [];

        // applications are only queryable per job
        const perJob = await Promise.all(
          jobs.map((j) =>
            api.get('/admin/applications/job/' + j.id)
              .then((r) => ({ job: j, apps: r.data || [] }))
              // a 404 here means "no applications for this job", not a failure
              .catch(() => ({ job: j, apps: [] }))
          )
        );

        if (cancelled) return;
        setData({ students: stuRes.data.totalElements ?? 0, jobs, apps: perJob });
        setStats(statsRes.data);
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

  const { students, jobs, apps } = data;

  const allApps = apps.flatMap((p) => p.apps);
  const activeJobs = jobs.filter((j) => j.isActive);

  const byStatus = allApps.reduce((acc, a) => {
    const k = a.applicationStatus || 'PENDING';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // distinct students who have applied at least once
  const engaged = new Set(allApps.map((a) => a.studentEmail || a.studentName)).size;
  const engagedPct = students ? Math.round((engaged / students) * 100) : 0;

  const topJobs = [...apps].sort((a, b) => b.apps.length - a.apps.length).slice(0, 5);
  const maxApps = Math.max(1, ...topJobs.map((p) => p.apps.length));

  const closingSoon = activeJobs
    .map((j) => ({ job: j, days: daysUntil(j.applicationDeadline) }))
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const recent = [...allApps]
    .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
    .slice(0, 6);

  const perActive = activeJobs.length
    ? (allApps.length / activeJobs.length).toFixed(1)
    : '0';

  const statCards = [
    { label: 'Students',      value: students,          tone: 'indigo',
      icon: <FiUsers size={17} />,      foot: engaged + ' have applied' },
    { label: 'Active jobs',   value: activeJobs.length, tone: 'emerald',
      icon: <FiBriefcase size={17} />,  foot: jobs.length + ' posted in total' },
    { label: 'Applications',  value: allApps.length,    tone: 'amber',
      icon: <FiFileText size={17} />,   foot: perActive + ' per active job' },
    { label: 'Participation', value: engagedPct + '%',  tone: 'violet',
      icon: <FiTrendingUp size={17} />, foot: engaged + ' of ' + students + ' students' },
  ];

  if (stats) {
    statCards.push({
      label: 'Placement rate',
      value: stats.overallPlacementRate + '%',
      tone: 'emerald',
      icon: <FiAward size={17} />,
      foot: stats.placedStudents + ' of ' + stats.totalStudents + ' students placed',
    });
  }

  return (
    <div className="animate-fade-in">
      <div className="dash-head">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.username}</strong>. Live snapshot of the placement cycle.
        </p>
      </div>

      {/* ── stat row ── */}
      <div className="dash-stats">
        {statCards.map((s) => (
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
        {/* ── applications per job ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Applications by job</h2>
            <span className="dash-panel-meta">top {topJobs.length}</span>
          </header>

          {topJobs.length === 0 ? (
            <p className="dash-none">No jobs posted yet.</p>
          ) : (
            <ul className="dash-bars">
              {topJobs.map(({ job, apps: list }) => (
                <li className="dash-bar-row" key={job.id}>
                  <div className="dash-bar-label">
                    <span className="dash-bar-company">{job.companyName}</span>
                    <span className="dash-bar-role">{job.jobRole}</span>
                  </div>
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{ width: Math.max(2, (list.length / maxApps) * 100) + '%' }}
                    />
                  </div>
                  <span className="dash-bar-count">{list.length}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── status breakdown ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Application status</h2>
            <span className="dash-panel-meta">{allApps.length} total</span>
          </header>

          {allApps.length === 0 ? (
            <p className="dash-none">No applications submitted yet.</p>
          ) : (
            <>
              <div className="dash-meter">
                {Object.entries(byStatus).map(([k, v]) => (
                  <span
                    key={k}
                    className={'dash-meter-seg dash-meter-seg--' + (STATUS_TONE[k] || 'info')}
                    style={{ width: (v / allApps.length) * 100 + '%' }}
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

        {/* ── deadlines ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Closing soon</h2>
            <span className="dash-panel-meta">next 30 days</span>
          </header>

          {closingSoon.length === 0 ? (
            <p className="dash-none">No active deadlines in the next 30 days.</p>
          ) : (
            <ul className="dash-list">
              {closingSoon.map(({ job, days }) => (
                <li className="dash-list-row" key={job.id}>
                  <span className={'dash-chip' + (days <= 7 ? ' dash-chip--urgent' : '')}>
                    <FiClock size={11} />
                    {days === 0 ? 'today' : days === 1 ? '1 day' : days + ' days'}
                  </span>
                  <div className="dash-list-main">
                    <span className="dash-list-title">{job.companyName}</span>
                    <span className="dash-list-sub">{job.jobRole} · {job.location}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── recent activity ── */}
        <section className="dash-panel">
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Latest applications</h2>
            <span className="dash-panel-meta">most recent</span>
          </header>

          {recent.length === 0 ? (
            <p className="dash-none">Nothing submitted yet.</p>
          ) : (
            <ul className="dash-list">
              {recent.map((a) => (
                <li className="dash-list-row" key={a.applicationId}>
                  <span className="dash-avatar" style={{ background: avatarGradientFor(a.studentEmail || a.studentName) }}>
                    {(a.studentName || '?').trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="dash-list-main">
                    <span className="dash-list-title">{a.studentName || 'Unknown student'}</span>
                    <span className="dash-list-sub">{a.companyName} · {a.jobRole}</span>
                  </div>
                  <span className="dash-list-time">{relTime(a.appliedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── department-wise placement ── */}
      {stats && (
        <section className="dash-panel" style={{ marginTop: '1rem' }}>
          <header className="dash-panel-head">
            <h2 className="dash-panel-title">Department-wise placement</h2>
            <span className="dash-panel-meta">{stats.departmentStats.length} departments</span>
          </header>

          {stats.departmentStats.length === 0 ? (
            <p className="dash-none">No student records yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Students</th>
                    <th>Applied</th>
                    <th>Placed</th>
                    <th>Placement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.departmentStats.map((d) => (
                    <tr key={d.department}>
                      <td>
                        <span className="badge" style={badgeColorFor(d.department, theme)}>{d.department}</span>
                      </td>
                      <td>{d.totalStudents}</td>
                      <td>{d.appliedStudents}</td>
                      <td>{d.placedStudents}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="dash-bar-track" style={{ width: '6rem' }}>
                            <div className="dash-bar-fill" style={{ width: Math.max(2, d.placementRate) + '%' }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {d.placementRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
