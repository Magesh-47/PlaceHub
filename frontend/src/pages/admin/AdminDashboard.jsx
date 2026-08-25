import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate, FaBriefcase, FaFileAlt, FaChevronRight } from 'react-icons/fa';
import { HiOutlineStatusOnline } from 'react-icons/hi';

const cards = [
  {
    title: 'Manage Students',
    path: '/admin/students',
    icon: <FaUserGraduate size={22} />,
    desc: 'View, add or edit student profiles and placement status.',
    color: '#4f46e5',
    bg: 'rgba(79,70,229,0.09)',
  },
  {
    title: 'Manage Jobs',
    path: '/admin/jobs',
    icon: <FaBriefcase size={22} />,
    desc: 'Create new job listings and manage active recruitment drives.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.09)',
  },
  {
    title: 'View Applications',
    path: '/admin/applications',
    icon: <FaFileAlt size={22} />,
    desc: 'Review and manage all student applications by job.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.09)',
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.username}</strong>. Here's an overview of the placement portal.
        </p>
      </div>

      {/* Module cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
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
                <span>Go to module</span>
                <FaChevronRight size={10} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System health */}
      <div
        className="card"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>System Health</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>All services are running normally.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HiOutlineStatusOnline size={18} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>Operational</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
