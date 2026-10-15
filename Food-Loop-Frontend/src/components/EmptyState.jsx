import { Icon } from "./Icon";

export function EmptyState({ icon = "box", title, description, action, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <button className="button button-soft" onClick={onAction}>{action}<Icon name="arrow" size={16} /></button>}
    </div>
  );
}
