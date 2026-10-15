import { Icon } from "./Icon";

export function MetricCard({ label, value, note, icon, tone = "green" }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon name={icon} size={18} /></span></div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  );
}
