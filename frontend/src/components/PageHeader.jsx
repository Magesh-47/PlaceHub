import React from 'react';

/**
 * PageHeader — consistent page title + optional subtitle + action buttons
 * Props: title, subtitle, actions (React node)
 */
const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header animate-fade-in">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
