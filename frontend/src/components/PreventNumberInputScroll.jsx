import { useEffect } from 'react';

// Scrolling the mouse wheel while a number input is focused silently changes
// its value, which is rarely what someone scrolling the page intends.
const PreventNumberInputScroll = () => {
  useEffect(() => {
    const onWheel = () => {
      const el = document.activeElement;
      if (el && el.tagName === 'INPUT' && el.type === 'number') {
        el.blur();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return null;
};

export default PreventNumberInputScroll;
