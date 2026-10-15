const statusLabels = {
  available: "Available",
  claimed: "Claimed",
  done: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status || "available"}`}><i />{statusLabels[status] || status}</span>;
}
