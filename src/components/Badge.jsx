const STATUS_STYLES = {
  pending: 'badge-warning',
  picked_up: 'badge-info',
  in_transit: 'badge-primary',
  out_for_delivery: 'badge-accent',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

const STATUS_LABELS = {
  pending: 'Pending',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'badge-ghost';
  return <span className={`badge ${cls} badge-sm gap-1.5`} title={STATUS_LABELS[status] || status}>
    <span className="status-dot" />
    {STATUS_LABELS[status] || status}
  </span>;
}

export const STATUS_OPTIONS = Object.keys(STATUS_STYLES).map((v) => ({ value: v, label: STATUS_LABELS[v] }));
