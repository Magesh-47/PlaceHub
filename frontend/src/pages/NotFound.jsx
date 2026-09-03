import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();
  const authed = isAuthenticated();
  const homePath = authed ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard') : '/login';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <FiAlertTriangle size={28} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.375rem' }}>404</h1>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Page not found</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
        </p>
        <Link to={homePath} className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={14} /> {authed ? 'Back to Dashboard' : 'Back to Login'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
