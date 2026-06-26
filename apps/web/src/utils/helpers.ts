
export const STATUS_COLORS:Record<string,string>= {
  APPROVED:"var(--color-success)",
  REJECTED:"var(--color-error)",
  PENDING:"var(--color-warning)",
  PROCESSING:"var(--color-info)",
  UPLOADED:"var(--color-primary-500)",
  FAILED:"#f87171",
  UNDER_REVIEW:"#a78bfa",
  EXPIRED:"#f59e0b",
  ARCHIVED:"var(--color-muted)",

  Healthy: "var(--color-success)",
  "Expiring Soon": "#f59e0b", // orange
  Expired: "var(--color-error)",
  Archived: "var(--color-muted)",
  Rejected: "#ec4899",// pink
};

export const TYPE_COLORS:Record<string,string>= {
  Image:"var(--color-primary-500)", 
  Video:"var(--color-info)",
  Audio:"var(--color-warning)", 
  Doc:"var(--color-secondary-300)",
  Other:"var(--color-secondary-400)",
};

export const JOB_STATUS_STYLE: Record<string, string>= {
  RUNNING:"bg-info/15 text-info border border-info/30",
  DONE:"bg-success/15 text-success border border-success/30",
  FAILED: "bg-error/15 text-error border border-error/30",
};

export const JOB_TYPE_LABEL:Record<string, string>= {
  THUMBNAIL:"Thumbnail",
  METADATA:"Metadata",
  DUPLICATE: "Duplication",
  EXPIRY: "Expiry Scan",
  REPORT:"Report",
};