import {type Asset } from "../utils/types";

const StatusBadge = ({ status }: { status: Asset['status'] }) => {
  const styles = {
  APPROVED: "bg-success/10 text-success border border-success/30",
  REJECTED: "bg-error/10 text-error border border-error/30",
  PENDING: "bg-warning/10 text-warning border border-warning/30",
  PROCESSING: "bg-info/10 text-info border border-info/30",
  UPLOADED: "bg-primary-500/10 text-primary-500 border border-primary-500/30",
  FAILED: "bg-error/10 text-error border border-error/30",
  UNDER_REVIEW: "bg-primary-300/10 text-primary-300 border border-primary-300/30",
  EXPIRED: "bg-warning/10 text-warning border border-warning/30",
  ARCHIVED: "bg-muted/10 text-muted border border-muted/30",
  }[status] || 'bg-gray/10 text-gray border border-gray/30';

  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${styles}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;