import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SPA navigation doesn't reset scroll position like a normal page load does,
// so a long page (e.g. the student profile) leaves the next route scrolled down.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
