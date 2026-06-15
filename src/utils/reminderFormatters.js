const TYPE_LABELS = {
  'new-application': 'New Application',
  'new_application': 'New Application',
  'interview': 'Interview',
  'application-status': 'Application Status',
  'application_status': 'Application Status',
  'job-deadline': 'Job Deadline',
  'job_deadline': 'Job Deadline',
  'job-expiring': 'Job Expiring',
  'job_expiring': 'Job Expiring',
  'verification-pending': 'Verification Pending',
  'verification_pending': 'Verification Pending',
};

const STATUS_LABELS = {
  'pending': 'Pending',
  'completed': 'Completed',
  'snoozed': 'Snoozed',
  'dismissed': 'Dismissed',
  'overdue': 'Overdue',
};

const TYPE_COLORS = {
  'new-application': '#3b82f6',
  'new_application': '#3b82f6',
  'interview': '#8b5cf6',
  'application-status': '#10b981',
  'application_status': '#10b981',
  'job-deadline': '#f59e0b',
  'job_deadline': '#f59e0b',
  'job-expiring': '#ef4444',
  'job_expiring': '#ef4444',
  'verification-pending': '#f97316',
  'verification_pending': '#f97316',
};

export const formatReminderType = (type) => {
  if (!type) return 'Unknown';
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  return type
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatReminderStatus = (status) => {
  if (!status) return '';
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getReminderColor = (type) => {
  return TYPE_COLORS[type] || '#94a3b8';
};
