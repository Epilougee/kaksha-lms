/**
 * Central Timezone Helper for Kaksha LMS
 * All dates, class start times, and assignment deadlines use Asia/Kolkata (IST).
 */

export const TIMEZONE = 'Asia/Kolkata';

// Format an ISO date/timestamp string into Indian Standard Time display
export function formatIST(dateString, options = {}) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';

  const defaultOptions = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
}

// Format date only in IST (e.g., "16 Nov 2026")
export function formatDateOnly(dateString) {
  return formatIST(dateString, { hour: undefined, minute: undefined, hour12: undefined });
}

// Format time only in IST (e.g., "10:30 AM")
export function formatTimeOnly(dateString) {
  return formatIST(dateString, { day: undefined, month: undefined, year: undefined });
}

// Convert an ISO timestamp to human relative time (e.g., "due in 2 days", "overdue by 3 hours")
export function formatRelativeIST(dateString, referenceNow = new Date()) {
  if (!dateString) return '—';
  const target = new Date(dateString);
  const now = new Date(referenceNow);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    if (absDays >= 1) return `${absDays}d ago`;
    if (absHours >= 1) return `${absHours}h ago`;
    return 'just now';
  }

  if (diffDays >= 1) return `in ${diffDays}d`;
  if (diffHours >= 1) return `in ${diffHours}h`;
  if (diffMins >= 1) return `in ${diffMins}m`;
  return 'starting now';
}
