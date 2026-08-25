import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaUserGraduate, FaBriefcase,
  FaFileAlt, FaSearch, FaUser, FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard',    icon: <FaTachometerAlt />, label: 'Dashboard'    },
  { to: '/admin/students',     icon: <FaUserGraduate />,  label: 'Students'     },
  { to: '/admin/jobs',         icon: <FaBriefcase />,     label: 'Jobs'         },
  { to: '/admin/applications', icon: <FaFileAlt />,       label: 'Applications' },
];

const studentLinks = [
  { to: '/student/dashboard',       icon: <FaTachometerAlt />,  label: 'Dashboard'       },
  { to: '/student/jobs',            icon: <FaSearch />,         label: 'Browse Jobs'     },
  { to: '/student/profile',         icon: <FaUser />,           label: 'My Profile'      },
  { to: '/student/my-applications', icon: <FaClipboardList />,  label: 'My Applications' },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;
  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : 'Student';

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">SP</div>
          <span className="sidebar-logo-text">Placement Hub</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{roleLabel} Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            Student Placement Hub · v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
