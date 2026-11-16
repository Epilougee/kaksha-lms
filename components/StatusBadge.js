'use client';

// Text label and status pill with icons (never color alone)
export default function StatusBadge({ status, isLate = false }) {
  if (status === 'Graded') {
    return (
      <span className="badge badge-graded">
        <i className="fa-solid fa-circle-check" aria-hidden="true" />
        Graded
      </span>
    );
  }

  if (status === 'Submitted') {
    return (
      <span className="badge badge-submitted">
        <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
        {isLate ? 'Submitted (Late)' : 'Submitted'}
      </span>
    );
  }

  if (status === 'Overdue') {
    return (
      <span className="badge badge-overdue">
        <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
        Overdue
      </span>
    );
  }

  // Pending
  return (
    <span className="badge badge-pending">
      <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
      Pending
    </span>
  );
}
