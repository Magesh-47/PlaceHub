import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUser, FaClipboardList, FaChevronRight } from 'react-icons/fa';

const cards = [
  {
    title: 'Browse Jobs',
    path: '/student/jobs',
    icon: <FaSearch size={22} />,
    desc: 'Explore available job opportunities and apply to those that match your skill set.',
    color: '#0d9488',
    bg: 'rgba(13,148,136,0.09)',
  },
  {
    title: 'My Profile',
    path: '/student/profile',
    icon: <FaUser size={22} />,
    desc: 'Keep your academic and personal information up-to-date to attract top recruiters.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.09)',
  },
  {
    title: 'My Applications',
    path: '/student/my-applications',
    icon: <FaClipboardList size={22} />,
    desc: 'Monitor the status of your applications and stay updated on the next steps.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.09)',
  },
];

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.username}</strong>. Ready to find your next career step?
        </p>
      </div>

      {/* Module cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {cards.map((card) => (
          <Link to={card.path} key={card.path} style={{ textDecoration: 'none' }}>
            <div
              className="card card-hover"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent blob */}
              <div
                style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: 90, height: 90,
                  background: `radial-gradient(circle at top right, ${card.color}18, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                {card.icon}
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {card.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65, flexGrow: 1, marginBottom: '1.25rem' }}>
                {card.desc}
              </p>

              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  color: card.color, fontWeight: 600, fontSize: '0.8125rem',
                }}
              >
                <span>Explore section</span>
                <FaChevronRight size={10} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
