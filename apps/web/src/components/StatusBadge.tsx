import type { Asset } from "../utils/types";

const StatusBadge = ({ status }: { status: Asset['status'] }) => {
  const styles = {
    APPROVED: 'bg-success/10 text-success border border-success/30',
    REJECTED: 'bg-error/10 text-error border border-error/30',
    FAILED: 'bg-error/10 text-error border border-error/30',
    PENDING: 'bg-secondary-400/10 text-secondary-200 border border-secondary-200/30',
    UNDER_REVIEW: 'bg-info/10 text-info border border-info/30',
    ARCHIVED:'bg-gray/10 text-gray border border-gray/30',
    UPLOADED:'bg-gray/10 text-gray border border-gray/30',
    EXPIRED: 'bg-warning/10 text-warning border border-warning/30'
  }[status] || 'bg-gray/10 text-gray border border-gray/30';

  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${styles}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;