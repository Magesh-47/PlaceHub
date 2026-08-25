import React from 'react';

/**
 * EmptyState — centred illustration + text for empty lists / tables
 * Props: icon (ReactNode), title, description, action (ReactNode)
 */
const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
