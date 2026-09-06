import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A single static <title> means the browser tab, history, and screen-reader
// navigation announcements never reflect which page you're actually on.
const PAGE_NAMES = {
  '/login': 'Sign In',
  '/admin/dashboard': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/jobs': 'Jobs',
  '/admin/applications': 'Applications',
  '/admin/reports': 'Reports',
  '/student/dashboard': 'Dashboard',
  '/student/jobs': 'Browse Jobs',
  '/student/profile': 'My Profile',
  '/student/my-applications': 'My Applications',
};

const DocumentTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageName = PAGE_NAMES[pathname];
    document.title = pageName ? `${pageName} · PlaceHub` : 'PlaceHub · Placement Portal';
  }, [pathname]);

  return null;
};

export default DocumentTitle;
