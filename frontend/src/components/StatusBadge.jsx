import React from 'react';

const STATUS_MAP = {
  ACCEPTED:  { variant: 'success', label: 'Accepted'  },
  APPROVED:  { variant: 'success', label: 'Approved'  },
  REJECTED:  { variant: 'danger',  label: 'Rejected'  },
  PENDING:   { variant: 'warning', label: 'Submitted' },
  SUBMITTED: { variant: 'info',    label: 'Submitted' },
  ACTIVE:    { variant: 'success', label: 'Active'    },
  INACTIVE:  { variant: 'neutral', label: 'Inactive'  },
  CLOSED:    { variant: 'danger',  label: 'Closed'    },
};

/**
 * StatusBadge — colour-coded pill for any application / job status
 * Props: status (string)
 */
const StatusBadge = ({ status }) => {
  const key = (status || '').toUpperCase();
  const config = STATUS_MAP[key] || { variant: 'neutral', label: status };
  return (
    <span className={`badge badge-${config.variant}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
