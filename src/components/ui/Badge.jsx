import React from 'react';

const Badge = ({ children, status }) => {
  const styles = {
    Active: 'bg-status-active-bg text-status-active-text border-status-active-border',
    Expired: 'bg-status-expired-bg text-status-expired-text border-status-expired-border',
    'Expiring Soon': 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
    Inactive: 'bg-status-inactive-bg text-status-inactive-text border-status-inactive-border',
    'New': 'bg-blue-50 text-blue-600 border-blue-200',
    'Contacted': 'bg-purple-50 text-purple-600 border-purple-200',
    'Converted': 'bg-green-50 text-green-600 border-green-200',
    'Lost': 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const currentStyle = styles[status] || styles.Inactive;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${currentStyle}`}>
      {children || status}
    </span>
  );
};

export default Badge;
